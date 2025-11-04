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
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { SvgIconComponent } from "angular-svg-icon";
import { debounceTime, distinctUntilChanged, tap } from "rxjs";
import { GeolocationUtils } from "../../helpers/geolocation-utils";
import { MapboxFeature } from "../../interfaces";
import { GeocodeService } from "../../services/api/geocode.service";
import { SpinnerComponent } from "../ui-kit/spinner/spinner.component";

interface Suggestion {
    id: string;
    name: string;
    lng: number;
    lat: number;
}

@Component({
    selector: "app-places-autocomplete",
    templateUrl: "./places-autocomplete.component.html",
    styleUrl: "./places-autocomplete.component.scss",
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, SvgIconComponent, SpinnerComponent],
})
export class PlacesAutocompleteComponent implements OnInit, OnChanges {
    @Input() initialValue = "";

    @Output() selectLocation = new EventEmitter<TopicLocation | null>();

    @ViewChild("searchInput") searchInput!: ElementRef<HTMLInputElement>;

    private readonly geocodeService = inject(GeocodeService);
    private readonly cdr = inject(ChangeDetectorRef);

    search = new FormControl("", {
        validators: [Validators.required, Validators.minLength(2)],
    });
    features: MapboxFeature[] = [];
    loading = false;
    showSuggestions = false;
    validationError = "";

    ngOnInit() {
        this.listenValueChanges();
        this.searchInput?.nativeElement.focus();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes["initialValue"] && this.initialValue && !this.search.value) {
            this.search.patchValue(this.initialValue);
        }
    }

    get clearButtonVisible(): boolean {
        return !!(this.search.value && this.search.value.length > 0);
    }

    get suggestions(): Suggestion[] {
        return this.features.map<Suggestion>((feature) => {
            const location = this.geocodeService.parseMapboxFeature(feature);
            const locationName = GeolocationUtils.getLocationFullname(location);
            return {
                id: feature.id,
                name: locationName,
                lng: location.lng,
                lat: location.lat,
            };
        });
    }

    get suggestionsVisible(): boolean {
        return this.showSuggestions && this.suggestions.length > 0 && !this.loading;
    }

    onFocus() {
        this.showSuggestions = true;
    }
    onBlur() {
        this.showSuggestions = false;
    }

    onKeyDown(event: KeyboardEvent) {
        const key = event.key;
        const allowedPattern = /^[a-zA-Z\s.,'’-]$/;
        const specialKeys = [
            "Backspace",
            "Tab",
            "ArrowLeft",
            "ArrowRight",
            "ArrowUp",
            "ArrowDown",
            "Delete",
            "Home",
            "End",
        ];
        if (specialKeys.includes(key)) {
            this.validationError = "";
            return;
        }
        if (!allowedPattern.test(key)) {
            this.validationError = "Only Latin letters are allowed.";
            event.preventDefault();
            return;
        }

        this.validationError = "";
    }

    clear() {
        this.search.setValue("");
        this.features = [];
        this.searchInput?.nativeElement.focus();
        this.selectLocation.emit(null);
    }

    selectSuggestion(suggestion: Suggestion) {
        const feature = this.features.find((feature) => feature.id === suggestion.id);
        if (!feature) return;
        const {
            geometry,
            properties: { context },
        } = feature;
        const location: TopicLocation = {
            lng: geometry.coordinates[0],
            lat: geometry.coordinates[1],
            country: context.country?.name || "",
            state: context.region?.name || context.district?.name || "",
            city: context.place?.name || "",
            fullname: GeolocationUtils.getLocationFullname({
                country: context.country?.name || "",
                state: context.region?.name || context.district?.name || "",
                city: context.place?.name || "",
            }),
        };
        this.selectLocation.emit(location);
        this.search.setValue(GeolocationUtils.getLocationFullname(location));
        this.showSuggestions = false;
        this.features = [];
    }

    private listenValueChanges() {
        this.search.valueChanges
            .pipe(
                tap(() => {
                    // if (this.search.valid) {
                    //     this.loading = true;
                    // }
                }),
                debounceTime(300),
                distinctUntilChanged(),
            )
            .subscribe((value) => {
                if (this.search.valid) {
                    this.loading = true;
                }
                if (value && this.search.valid) {
                    this.geocodeService.getPlacesByQuery({ 
                        query: value, 
                        limit: 5, 
                        types: ["region", "district"] 
                    }).subscribe({
                        next: (places) => {
                            this.features = places.features;
                            this.loading = false;
                            this.cdr.detectChanges();
                        },
                        error: () => {
                            this.loading = false;
                        },
                        complete: () => {
                            this.loading = false;
                        },
                    });
                }
            });
    }
}
