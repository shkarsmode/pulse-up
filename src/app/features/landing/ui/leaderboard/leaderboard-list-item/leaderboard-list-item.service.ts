import { inject, Injectable } from "@angular/core";
import { LeaderboardFiltersService } from "../leaderboard-filters/leaderboard-filters.service";
import { combineLatest, map, tap } from "rxjs";
import { getTimeframeStatus } from "../../../helpers/getTimeframeStatus";

@Injectable({
    providedIn: "root",
})
export class LeaderboardListItemService {
    private leaderboardFiltersService = inject(LeaderboardFiltersService);

    public isSupportersVisible$ = this.leaderboardFiltersService.timeframe$.pipe(
        map((timeframe) => timeframe === "Month" || timeframe === "Week"),
        tap((isVisible) => console.log("isSupportersVisible", isVisible)),
    );

    public isActiveTimeframe$ = combineLatest([
        this.leaderboardFiltersService.date$,
        this.leaderboardFiltersService.timeframe$,
    ]).pipe(
        map(([date, timeframe]) => {
            if (!date) return false;
            return getTimeframeStatus(date, timeframe) === "Active";
        }),
    );
}
