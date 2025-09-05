import { inject, Injectable } from "@angular/core";
import { combineLatest, map, switchMap } from "rxjs";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { LeaderboardService } from "../leaderboard.service";
import { DateUtils } from "../../../helpers/date-utils";
import { LeaderboardFiltersService } from "../leaderboard-filters/leaderboard-filters.service";
import { ILeaderboardLocation } from "../../../interfaces/leaderboard-filter.interface";

@Injectable({
    providedIn: "root",
})
export class LeaderboardNoResultsService {
    private pulseService = inject(PulseService);
    private leaderboardService = inject(LeaderboardService);
    private leaderboardFiltersService = inject(LeaderboardFiltersService);

    private filter$ = this.leaderboardService.filters$;

    private noResultsText$ = this.filter$.pipe(
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
        switchMap(({ date, timeframe, location }) => {
            console.log({ location, timeframe });

            return this.pulseService.getLeaderboardLocations({
                date: DateUtils.toISOString(DateUtils.getStatrtOfDay(date)),
                timeframe,
                "Location.Country": location?.country || undefined,
            });
        }),
        map((locations) => locations.filter((location) => !!location.state)),
        map((locations) => locations.slice(0, 3)),
        map((locations) => locations.map((location) => ({
            country: location.country,
            region: location.state,
            city: location.city,
        } as ILeaderboardLocation))),
    );

    public text$ = combineLatest([this.noResultsText$, this.suggestions$]).pipe(
        map(([noResultsText, suggestions]) => {
            const hasSuggestions = suggestions && suggestions.length > 0;
            return `${noResultsText} ${hasSuggestions ? " See results for:" : ""}`;
        }),
    );

    public setSuggestedLocation(location: ILeaderboardLocation) {
      const {country, region} = location;
      if (!country || !region) return;
        this.leaderboardFiltersService.changeLocation({
            id: `${country}-${region}`,
            label: region,
            type: "quickPick",
            data: location,
        });
    }
}
