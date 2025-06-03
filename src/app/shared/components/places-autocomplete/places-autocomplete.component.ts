import { Component, EventEmitter, inject, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { SvgIconComponent } from "angular-svg-icon";
import { debounceTime, distinctUntilChanged, tap } from "rxjs";
import { GeocodeService } from "../../services/api/geocode.service";
import { MapboxFeature } from "../../interfaces";
import { SpinnerComponent } from "../ui-kit/spinner/spinner.component";
import { TopicLocation } from "@/app/features/user/interfaces/topic-location.interface";

interface Suggestion {
    id: string;
    name: string;
    lng: number;
}

@Component({
    selector: "app-places-autocomplete",
    templateUrl: "./places-autocomplete.component.html",
    styleUrl: "./places-autocomplete.component.scss",
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, SvgIconComponent, SpinnerComponent],
})
export class PlacesAutocompleteComponent {
    @Output() locationSelected = new EventEmitter<TopicLocation>();

    private readonly geocodeService = inject(GeocodeService);

    search = new FormControl("", {
        validators: [
            Validators.required,
            Validators.minLength(2),
            Validators.pattern(/^[a-zA-Z\s.,'’-]+$/),
        ],
    });
    features: MapboxFeature[] = [];
    loading = false;
    showSuggestions = false;

    ngOnInit() {
        this.listenValueChanges();
    }

    get clearButtonVisible(): boolean {
        return !!(this.search.value && this.search.value.length > 0);
    }

    get suggestions(): Suggestion[] {
        return this.features.map<Suggestion>((feature) => ({
            id: feature.id,
            name: this.getLocationName(feature),
            lng: feature.geometry.coordinates[0],
            lat: feature.geometry.coordinates[1],
        }));
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

    clear() {
        this.search.setValue("");
        this.features = [];
    }

    selectSuggestion(suggestion: Suggestion) {
        const feature = this.features.find((feature) => feature.id === suggestion.id);
        if (!feature) return;
        const {
            geometry,
            properties: { context },
        } = feature;
        this.locationSelected.emit({
            lng: geometry.coordinates[0],
            lat: geometry.coordinates[1],
            country: context.country?.name || "",
            state: (context.region?.name || context.district?.name) || "",
            city: context.place?.name || "",
        });
        this.search.setValue(suggestion.name);
        this.showSuggestions = false;
        this.features = [];
    }

    private listenValueChanges() {
        this.search.valueChanges
            .pipe(
                tap(() => {
                    if (this.search.valid) {
                        this.loading = true;
                    }
                }),
                debounceTime(300),
                distinctUntilChanged(),
            )
            .subscribe((value) => {
                if (value && this.search.valid) {
                    this.geocodeService.getPlaces(value).subscribe({
                        next: (places) => {
                            console.log(places);
                            this.features = places.features;
                            this.loading = false;
                        },
                        error: (err) => {
                            console.error("Error fetching places:", err);
                            this.loading = false;
                        },
                        complete: () => {
                            this.loading = false;
                        },
                    });
                }
            });
    }

    private getLocationName(place: MapboxFeature): string {
        return place.properties.full_address;
    }
}
