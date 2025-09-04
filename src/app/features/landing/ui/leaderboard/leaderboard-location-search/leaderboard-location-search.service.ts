import { computed, DestroyRef, inject, Injectable, signal } from "@angular/core";
import { FormControl } from "@angular/forms";
import {
    combineLatest,
    debounceTime,
    distinctUntilChanged,
    filter,
    map,
    switchMap,
    tap,
} from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { GeocodeService } from "@/app/shared/services/api/geocode.service";
import { StringUtils } from "@/app/shared/helpers/string-utils";
import { MapboxFeature } from "@/app/shared/interfaces";
import { LeaderboardFiltersService } from "../leaderboard-filters/leaderboard-filters.service";
import { ILeaderboardLocationOption } from "../../../interfaces/leaderboard-filter.interface";

@Injectable({ providedIn: "root" })
export class LeaderboardLocationSearchService {
    private destroyRef = inject(DestroyRef);
    private geocodeService = inject(GeocodeService);
    private leaderboardFiltersService = inject(LeaderboardFiltersService);

    private _suggestions = signal<MapboxFeature[]>([]);

    public searchControl = new FormControl("");
    public options = computed(() => {
        const suggestions = this._suggestions();
        return suggestions.map(({ properties }) => properties.full_address);
    });
    public suggestions = this._suggestions.asReadonly();
    public clearButtonVisible$ = combineLatest([
        this.searchControl.valueChanges,
        this.leaderboardFiltersService.location$,
    ]).pipe(
        map(([, location]) => {
            const value = this.searchControl.value;
            return value === location.label;
        }),
    );

    constructor() {
        const validFeatureTypes = ["country", "region", "place"];
        this.searchControl.valueChanges
            .pipe(
                debounceTime(400),
                distinctUntilChanged(),
                filter((query) => {
                    if (!query) {
                        this._suggestions.set([]);
                        return false;
                    };
                    const searchString = StringUtils.normalizeWhitespace(query);
                    return searchString.length > 1;
                }),
                switchMap((query) => this.geocodeService.getPlacesByQuery(query || "")),
                map((response) => {
                    const collection = response;
                    collection.features = collection.features.filter((feature) => {
                        return validFeatureTypes.includes(feature.properties.feature_type);
                    });
                    return collection;
                }),
                tap((res) => this._suggestions.set(res.features)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();

        this.leaderboardFiltersService.location$
            .pipe(
                tap((location) => {
                    if (location.type === "search") {
                        this.searchControl.setValue(location.label, { emitEvent: true });
                    } else {
                        this.searchControl.setValue("", { emitEvent: true });
                    }
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    public setSuggestion(suggestion: MapboxFeature) {
        this._suggestions.set([]);
        this.leaderboardFiltersService.changeLocation({
            id: suggestion.id,
            label: suggestion.properties.full_address,
            type: "search",
            data: this.mapFeatureToLocationData(suggestion),
        });
    }

    private mapFeatureToLocationData(feature: MapboxFeature): ILeaderboardLocationOption["data"] {
        switch (feature.properties.feature_type) {
            case "country":
                return {
                    country: feature.properties.context.country?.name || null,
                    region: null,
                    city: null,
                };
            case "region":
                return {
                    country: feature.properties.context.country?.name || null,
                    region: feature.properties.context.region?.name || null,
                    city: null,
                };
            case "place":
                return {
                    country: feature.properties.context.country?.name || null,
                    region: feature.properties.context.region?.name || null,
                    city: feature.properties.context.place?.name || null,
                };
            default:
                return {
                    country: null,
                    region: null,
                    city: null,
                };
        }
    }
}
