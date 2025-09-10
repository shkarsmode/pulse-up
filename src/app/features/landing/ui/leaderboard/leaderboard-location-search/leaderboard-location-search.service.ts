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
        this.searchControl.valueChanges
            .pipe(
                tap((query) => {
                    const isSearchMode = !!query?.length && query.length > 0;
                    this.leaderboardLocationFilterService.setSearchMode(isSearchMode);
                    if (!query) {
                        this.leaderboardLocationFilterService.setSearchOptions([]);
                    }
                }),
                filter((query) => {
                    if (!query) return false;
                    const searchString = StringUtils.normalizeWhitespace(query);
                    return !!searchString.length;
                }),
                tap(() => this.leaderboardLocationFilterService.setSearching(true)),
                debounceTime(400),
                distinctUntilChanged(),
                switchMap((query) => this.geocodeService.getPlacesByQuery({
                    query: query || "",
                    limit: 5,
                    types: ["country", "region"],
                })),
                tap(({ features }) => {
                    this.leaderboardLocationFilterService.setSearchOptions(features);
                    this.leaderboardLocationFilterService.setSearching(false);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    public clearSuggestions() {
        this.searchControl.setValue("");
        this.leaderboardLocationFilterService.setSearchOptions([]);
    }
}
