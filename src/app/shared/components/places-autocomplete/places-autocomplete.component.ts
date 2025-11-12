import { TopicLocation } from "@/app/features/user/interfaces/topic-location.interface";
import { CommonModule } from "@angular/common";
import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    inject,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { SvgIconComponent } from "angular-svg-icon";
import {
    BehaviorSubject,
    catchError,
    debounceTime,
    distinctUntilChanged,
    filter,
    finalize,
    map,
    of,
    Subject,
    switchMap,
    takeUntil,
    tap
} from "rxjs";
import { MapboxFeature } from "../../interfaces";
import { GeocodeService } from "../../services/api/geocode.service";
import { SpinnerComponent } from "../ui-kit/spinner/spinner.component";

interface Suggestion {
    id: string;
    name: string;
    lng: number;
    lat: number;
    type?: string;
}

const SEARCH_TYPES: string[] = [
    "country",
    "region",
    "district",
    "place",
    "locality",
    "neighborhood",
    "address",
    "postcode",
];

@Component({
    selector: "app-places-autocomplete",
    templateUrl: "./places-autocomplete.component.html",
    styleUrl: "./places-autocomplete.component.scss",
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, SvgIconComponent, SpinnerComponent],
})
export class PlacesAutocompleteComponent implements OnInit, OnChanges, OnDestroy {
    @Input() initialValue = "";
    @Output() selectLocation = new EventEmitter<TopicLocation | null>();
    @ViewChild("searchInput") searchInput!: ElementRef<HTMLInputElement>;

    private readonly geocodeService = inject(GeocodeService);
    private readonly cdr = inject(ChangeDetectorRef);

    private readonly destroy$ = new Subject<void>();
    private readonly userProximity$ = new BehaviorSubject<{ lng: number; lat: number } | null>(null);

    search = new FormControl("", {
        validators: [Validators.required, Validators.minLength(2)],
        nonNullable: true,
    });

    features: MapboxFeature[] = [];
    loading = false;
    showSuggestions = false;
    noResults = false;

    highlightedIndex = -1;

    ngOnInit(): void {
        this.listenValueChanges();
        this.searchInput?.nativeElement.focus();
        // Optionally push user coords when available:
        // this.userProximity$.next({ lng: <lng>, lat: <lat> });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes["initialValue"] && this.initialValue && !this.search.value) {
            this.search.patchValue(this.initialValue);
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    get clearButtonVisible(): boolean {
        return this.search.value.length > 0;
    }

    get suggestions(): Suggestion[] {
        return this.features.map<Suggestion>((feature) => {
            const fullName = (feature as any).place_name || this.buildFullNameFromContext(feature);
            const lng = feature.geometry?.coordinates?.[0] ?? 0;
            const lat = feature.geometry?.coordinates?.[1] ?? 0;
            const type =
                (feature.place_type && feature.place_type[0]) ||
                feature.properties?.category ||
                feature.properties?.feature_type ||
                "unknown";
            return { id: feature.id, name: fullName, lng, lat, type };
        });
    }

    get suggestionsVisible(): boolean {
        return this.showSuggestions && !this.loading && this.suggestions.length > 0;
    }

    get activeOptionId(): string | null {
        return this.highlightedIndex >= 0 ? `suggestion-${this.highlightedIndex}` : null;
    }

    onFocus(): void {
        this.showSuggestions = true;
    }

    onBlur(): void {
        // Keep UX predictable: close after selection/mousedown handled.
        this.showSuggestions = false;
        this.highlightedIndex = -1;
    }

    clear(): void {
        this.search.setValue("");
        this.features = [];
        this.noResults = false;
        this.highlightedIndex = -1;
        this.searchInput?.nativeElement.focus();
        this.selectLocation.emit(null);
    }

    onInputKeyDown(event: KeyboardEvent): void {
        if (!this.suggestionsVisible && event.key !== "Escape") return;

        if (event.key === "ArrowDown") {
            event.preventDefault();
            this.highlightedIndex = Math.min(this.highlightedIndex + 1, this.suggestions.length - 1);
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            this.highlightedIndex = Math.max(this.highlightedIndex - 1, 0);
        } else if (event.key === "Enter") {
            if (this.highlightedIndex >= 0) {
                const picked = this.suggestions[this.highlightedIndex];
                this.selectSuggestion(picked);
            }
        } else if (event.key === "Escape") {
            this.showSuggestions = false;
            this.highlightedIndex = -1;
        }
    }

    selectSuggestion(suggestion: Suggestion): void {
        const feature = this.features.find((f) => f.id === suggestion.id);
        if (!feature) return;

        const { coordinates } = feature.geometry;
        const ctx = feature.properties?.context ?? {};

        const location: TopicLocation = {
            lng: coordinates[0],
            lat: coordinates[1],
            country: ctx.country?.name || "",
            state: ctx.region?.name || ctx.district?.name || "",
            city: ctx.place?.name || ctx.locality?.name || "",
            fullname: (feature as any).place_name || this.buildFullNameFromContext(feature),
        };

        this.selectLocation.emit(location);
        this.search.setValue(location.fullname);
        this.showSuggestions = false;
        this.features = [];
        this.noResults = false;
        this.highlightedIndex = -1;
    }

    private listenValueChanges(): void {
        this.search.valueChanges
            .pipe(
                map((v) => v.trim().replace(/\s+/g, " ")),
                distinctUntilChanged(),
                debounceTime(250),
                tap(() => {
                    this.noResults = false;
                    this.showSuggestions = true;
                }),
                filter((v) => v.length >= 2 && this.search.valid),
                tap(() => (this.loading = true)),
                switchMap((query) =>
                    this.userProximity$.pipe(
                        takeUntil(this.destroy$),
                        switchMap((prox) =>
                            this.geocodeService
                                .getPlacesByQuery({
                                    query,
                                    limit: 8,
                                    types: SEARCH_TYPES,
                                    // language: "en,uk", // enable if your API supports it
                                })
                                .pipe(
                                    catchError(() => of({ features: [] as MapboxFeature[] })),
                                    switchMap((resp) => {
                                        if (resp.features?.length) return of(resp);
                                        // Fallback: broaden types to provider default
                                        return this.geocodeService
                                            .getPlacesByQuery({ query: '', limit: 8, types: SEARCH_TYPES })
                                            .pipe(catchError(() => of({ features: [] as MapboxFeature[] })));
                                    }),
                                    finalize(() => {
                                        this.loading = false;
                                        this.cdr.detectChanges();
                                    }),
                                ),
                        ),
                    ),
                ),
                takeUntil(this.destroy$),
            )
            .subscribe((places) => {
                this.features = this.deduplicateById(places.features || []);
                this.noResults = this.features.length === 0;
                this.cdr.detectChanges();
            });
    }

    private buildFullNameFromContext(feature: MapboxFeature): string {
        const ctx = (feature as any)?.properties?.context ?? {};
        const label =
            (feature as any).text ||
            (feature as any).name ||
            (feature as any).properties?.name ||
            "";
        const parts: string[] = [];
        if (label) parts.push(label);

        const city = ctx.place?.name || ctx.locality?.name || "";
        const region = ctx.region?.name || ctx.district?.name || "";
        const country = ctx.country?.name || "";
        const postcode = (feature as any).properties?.postcode || ctx.postcode?.name || "";

        [city, region, country].forEach((p) => p && !parts.includes(p) && parts.push(p));
        if (postcode && !parts.includes(postcode)) parts.push(postcode);

        return parts.filter(Boolean).join(", ");
    }

    private deduplicateById(list: MapboxFeature[]): MapboxFeature[] {
        const seen = new Set<string>();
        return list.filter((f) => {
            if (!f.id) return true;
            if (seen.has(f.id)) return false;
            seen.add(f.id);
            return true;
        });
    }
}
