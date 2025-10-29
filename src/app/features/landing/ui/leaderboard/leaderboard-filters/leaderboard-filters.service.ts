import { inject, Injectable } from "@angular/core";
import { combineLatest, distinctUntilChanged, map } from "rxjs";
import { LeaderboardTimeframeExtended } from "@/app/shared/interfaces";
import { LeaderboardService } from "../leaderboard.service";
import { DateUtils } from "@/app/shared/helpers/date-utils";
import { ILeaderboardLocationOption } from "../../../interfaces/leaderboard-filter.interface";
import { getTimeframeStatus } from "../../../helpers/getTimeframeStatus";

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
            let dateFormatted = "";
            const status = getTimeframeStatus(date || new Date(), timeframe);
            switch (timeframe) {
                case "last24Hours":
                    dateFormatted = "";
                    break;
                case "Day":
                    dateFormatted = date ? DateUtils.format(date, "MMM DD") : "";
                    break;
                case "Week":
                    dateFormatted = date
                        ? `${DateUtils.format(DateUtils.getStartOfWeek(date), "MMM DD")} - ${DateUtils.format(DateUtils.getEndOfWeek(date), "MMM DD")}`
                        : "";
                    break;
                case "Month":
                    dateFormatted = date ? DateUtils.format(date, "MMM YYYY") : "";
                    break;
                default:
                    dateFormatted = "";
            }

            if (status === "Active") {
                dateFormatted += ` UTC`;
            }
            return dateFormatted;
        }),
    );
    public location$ = this.leaderboardService.tempFilters$.pipe(
        map((filters) => filters.location),
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
                this.leaderboardService.setDate(DateUtils.getStartOfWeek(new Date()));
                break;
            case "Month":
                this.leaderboardService.setDate(DateUtils.getStartOfMonth(new Date()));
                break;
        }
        this.leaderboardService.setTimeframe(timeframe);
        this.leaderboardService.applyFilters();
    }

    public changeLocation(option: ILeaderboardLocationOption) {
        this.leaderboardService.setLocation(option);
        this.leaderboardService.applyFilters();
    }

    public resetFilters() {
        this.leaderboardService.setDate(new Date());
        this.leaderboardService.setTimeframe("last24Hours");
        this.leaderboardService.applyFilters();
    }
}
