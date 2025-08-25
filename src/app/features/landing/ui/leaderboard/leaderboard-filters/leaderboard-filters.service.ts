import { inject, Injectable } from "@angular/core";
import { combineLatest, distinctUntilChanged, map } from "rxjs";
import { LeaderboardTimeframeExtended } from "@/app/shared/interfaces";
import { LeaderboardService } from "../../../services/leaderboard.service";
import { DateUtils } from "../../../helpers/date-utils";

interface Option {
    value: LeaderboardTimeframeExtended;
    label: string;
}

const TIMEFRAME_OPTIONS: Option[] = [
    { value: "last24Hours", label: "Last 24 Hours" },
    { value: "Day", label: "Daily" },
    { value: "Week", label: "Weekly" },
    { value: "Month", label: "Monthly" },
];

@Injectable({
    providedIn: "root",
})
export class LeaderboardFiltersService {
    private leaderboardService = inject(LeaderboardService);

    public timeframeOptions: Option[] = TIMEFRAME_OPTIONS;
    public date$ = this.leaderboardService.tempFilters$.pipe(
        map((filters) => filters.date),
        distinctUntilChanged(),
    );
    public timeframe$ = this.leaderboardService.tempFilters$.pipe(
        map((filters) => filters.timeframe),
        distinctUntilChanged(),
    );
    public dateFormatted$ = combineLatest([this.date$, this.timeframe$]).pipe(
        map(([date, timeframe]) => {
            switch (timeframe) {
                case "last24Hours":
                    return "";
                case "Day":
                    return date ? DateUtils.format(date, "MMM DD") : "";
                case "Week":
                    return date
                        ? `${DateUtils.format(DateUtils.getStartOfWeek(date), "MMM DD")} - ${DateUtils.format(DateUtils.getEndOfWeek(date), "MMM DD")}`
                        : "";
                case "Month":
                    return date ? DateUtils.format(date, "MMM YYYY") : "";
                default:
                    return "";
            }
        }),
    );

    public changeDate(date: Date | null) {
        this.leaderboardService.setDate(date);
        this.leaderboardService.applyFilters();
    }

    public changeTimeframe(timeframe: LeaderboardTimeframeExtended) {
        const today = new Date();
        switch (timeframe) {
            case "last24Hours":
                this.leaderboardService.setDate(today);
                break;
            case "Day":
                this.leaderboardService.setDate(today);
                break;
            case "Week":
                this.leaderboardService.setDate(DateUtils.getEndOfWeek(new Date()));
                break;
            case "Month":
                this.leaderboardService.setDate(DateUtils.getEndOfMonth(new Date()));
                break;
        }
        this.leaderboardService.setTimeframe(timeframe);
        this.leaderboardService.applyFilters();
    }

    public resetFilters() {
        this.leaderboardService.setDate(new Date());
        this.leaderboardService.setTimeframe("last24Hours");
        this.leaderboardService.applyFilters();
    }
}
