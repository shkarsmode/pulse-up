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
                tap((query) => {
                    if (!query) {
                        this._suggestions.set([]);
                    }
                }),
                debounceTime(400),
                distinctUntilChanged(),
                filter((query) => {
                    if (!query) return false;
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

    public clearSuggestions() {
        this._suggestions.set([]);
    }
}
