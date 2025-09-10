import { DestroyRef, inject, Injectable } from "@angular/core";
import { FormControl } from "@angular/forms";
import {
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
import { LeaderboardLocationFilterService } from "../leaderboard-filters/leaderboard-location-filter/leaderboard-location-filter.service";

@Injectable({ providedIn: "root" })
export class LeaderboardLocationSearchService {
    private destroyRef = inject(DestroyRef);
    private geocodeService = inject(GeocodeService);
    private leaderboardLocationFilterService = inject(LeaderboardLocationFilterService);

    public searchControl = new FormControl("");
    public clearButtonVisible$ = this.searchControl.valueChanges.pipe(
        map((value) => value && value.length > 0),
    );

    constructor() {
        const validFeatureTypes = ["country", "region"];
        this.searchControl.valueChanges
            .pipe(
                tap((query) => {
                    const isSearchMode = !!query?.length && query.length > 0;
                    this.leaderboardLocationFilterService.setSearchMode(isSearchMode);
                    if (!query) {
                        this.leaderboardLocationFilterService.setSearchOptions([]);
                    }
                }),
                debounceTime(300),
                distinctUntilChanged(),
                filter((query) => {
                    if (!query) return false;
                    const searchString = StringUtils.normalizeWhitespace(query);
                    return !!searchString.length;
                }),
                switchMap((query) => this.geocodeService.getPlacesByQuery({
                    query: query || "",
                    limit: 5,
                    types: ["country", "region"],
                })),
                map((response) => {
                    const collection = response;
                    collection.features = collection.features.filter((feature) => {
                        return validFeatureTypes.includes(feature.properties.feature_type);
                    });
                    return collection;
                }),
                tap(({ features }) =>
                    this.leaderboardLocationFilterService.setSearchOptions(features),
                ),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    public clearSuggestions() {
        this.searchControl.setValue("");
        this.leaderboardLocationFilterService.setSearchOptions([]);
    }
}
