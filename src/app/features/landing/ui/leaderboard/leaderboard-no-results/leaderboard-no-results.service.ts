import { inject, Injectable } from "@angular/core";
import { catchError, distinctUntilChanged, map, of, shareReplay, switchMap } from "rxjs";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { LeaderboardService } from "../leaderboard.service";
import { DateUtils } from "../../../helpers/date-utils";
import { LeaderboardFiltersService } from "../leaderboard-filters/leaderboard-filters.service";
import { ILeaderboardLocationOption } from "../../../interfaces/leaderboard-filter.interface";
import { createLocationOption } from "../../../helpers/createLocationOption";

@Injectable({
    providedIn: "root",
})
export class LeaderboardNoResultsService {
    private pulseService = inject(PulseService);
    private leaderboardService = inject(LeaderboardService);
    private leaderboardFiltersService = inject(LeaderboardFiltersService);

    private filter$ = this.leaderboardService.filters$.pipe(
        shareReplay({ bufferSize: 1, refCount: true }),
    );

    public noResultsText$ = this.filter$.pipe(
        map((filter) => {
            const baseText = "No pulse in this time period.";
            const location = filter.location;

            if (!location) {
                return baseText;
            }

            const { city, region, country } = location;
            const isGlobal = !city && !region && !country;

            if (isGlobal) {
                return baseText;
            }

            const place = city || region || country;
            return `No pulse in ${place} in this time period.`;
        }),
    );

    public suggestions$ = this.filter$.pipe(
        distinctUntilChanged((prev, curr) => {
            return (
                prev.date === curr.date &&
                prev.timeframe === curr.timeframe &&
                JSON.stringify(prev.location) === JSON.stringify(curr.location)
            );
        }),
        switchMap(({ date, timeframe, location }) => {
            return this.pulseService
                .getLeaderboardLocations({
                    date: DateUtils.toISOString(DateUtils.getStatrtOfDay(date)),
                    timeframe,
                    "Location.Country": location?.country || undefined,
                })
                .pipe(
                    catchError(() => {
                        console.log("Error fetching leaderboard locations by state");
                        return of([]);
                    }),
                    switchMap((locations) => {
                        if (locations.length) {
                            return of(locations).pipe(
                                map((locations) =>
                                    locations.filter((location) => !!location.state),
                                ),
                                map((locations) =>
                                    locations.reduce(
                                        (acc, curr) => {
                                            if (!acc.find((loc) => loc.state === curr.state)) {
                                                acc.push(curr);
                                            }
                                            return acc;
                                        },
                                        [] as typeof locations,
                                    ),
                                ),
                                map((locations) => locations.slice(0, 3)),
                                map((locations) =>
                                    locations.map((location) =>
                                        createLocationOption({
                                            location,
                                        }),
                                    ),
                                ),
                            );
                        } else {
                            return this.pulseService
                                .getLeaderboardLocations({
                                    date: DateUtils.toISOString(DateUtils.getStatrtOfDay(date)),
                                    timeframe,
                                })

                                .pipe(
                                    catchError(() => {
                                        console.log(
                                            "Error fetching leaderboard locations by country",
                                        );
                                        return of([]);
                                    }),
                                    map((locations) =>
                                        locations.filter((location) => !!location.country),
                                    ),
                                    map((locations) =>
                                        locations.reduce(
                                            (acc, curr) => {
                                                if (
                                                    !acc.find((loc) => loc.country === curr.country)
                                                ) {
                                                    acc.push(curr);
                                                }
                                                return acc;
                                            },
                                            [] as typeof locations,
                                        ),
                                    ),
                                    map((locations) => locations.slice(0, 3)),
                                    map((locations) =>
                                        locations.map((location) =>
                                            createLocationOption({
                                                location,
                                            }),
                                        ),
                                    ),
                                );
                        }
                    }),
                    shareReplay({ bufferSize: 1, refCount: true }),
                );
        }),
    );

    public setSuggestedLocation(option: ILeaderboardLocationOption) {
        this.leaderboardFiltersService.changeLocation(option);
    }
}
