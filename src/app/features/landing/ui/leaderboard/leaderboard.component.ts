import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { AngularSvgIconModule } from "angular-svg-icon";
import { combineLatest, filter, map } from "rxjs";
import { LeaderboardService } from "../../services/leaderboard.service";
import { SpinnerComponent } from "@/app/shared/components/ui-kit/spinner/spinner.component";
import { LeaderboardTimeframe, LeaderboardTimeframeExtended } from "@/app/shared/interfaces";
import { CustomDatepickerComponent } from "../datepicker/datepicker.component";
import { LeaderboardListItemComponent } from "./leaderboard-list-item/leaderboard-list-item.component";
import { LeaderboardHintComponent } from "./leaderboard-hint/leaderboard-hint.component";
import { LeaderboardQuickDatesComponent } from "./leaderboard-quick-dates/leaderboard-quick-dates.component";

const dateFormats: Record<LeaderboardTimeframe, string> = {
    Day: "MMMM d, y",
    Week: "MMMM d, y",
    Month: "MMMM y",
};

@Component({
    selector: "app-leaderboard",
    standalone: true,
    imports: [
        CommonModule,
        SpinnerComponent,
        AngularSvgIconModule,
        CustomDatepickerComponent,
        LeaderboardListItemComponent,
        LeaderboardHintComponent,
        LeaderboardQuickDatesComponent,
    ],
    providers: [DatePipe],
    templateUrl: "./leaderboard.component.html",
    styleUrl: "./leaderboard.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardComponent {
    private datePipe = inject(DatePipe);
    private leaderboardService = inject(LeaderboardService);

    private filter$ = this.leaderboardService.filters$;
    private tempFilter$ = this.leaderboardService.tempFilters$;
    private datepickerTimeframe: LeaderboardTimeframeExtended | null = null;

    public isQuickDatesVisible = signal(true);
    public datepickerTimeframes = signal<LeaderboardTimeframeExtended[]>(["Day", "Week", "Month"]);
    public isLoading$ = this.leaderboardService.isLoading$;
    public isError$ = this.leaderboardService.isError$;
    public topics$ = this.leaderboardService.topics$;
    public timeframeStatus$ = this.leaderboardService.timeframeStatus$;
    public date$ = this.filter$.pipe(map((filter) => filter.date));
    public tempDate$ = this.tempFilter$.pipe(map((tempFilter) => tempFilter.date));
    public timeframe$ = this.filter$.pipe(map((filter) => filter.timeframe));
    public hintTimeframe$ = this.timeframe$.pipe(
        filter((timeframe) => timeframe !== "last24Hours"),
    );
    public tempTimeframe$ = this.tempFilter$.pipe(map((tempFilter) => tempFilter.timeframe));

    public isSpinnerVisible$ = combineLatest([this.isLoading$, this.isError$]).pipe(
        map(([isLoading, isError]) => isLoading && !isError),
    );
    public isContentVisible$ = combineLatest([this.isLoading$, this.isError$, this.topics$]).pipe(
        map(
            ([isLoading, isError, topics]) => !isLoading && !isError && topics && topics.length > 0,
        ),
    );
    public isErrorVisible$ = combineLatest([this.isLoading$, this.isError$]).pipe(
        map(([isLoading, isError]) => !isLoading && isError),
    );
    public isEmpty$ = combineLatest([this.topics$, this.isLoading$]).pipe(
        map(([topics, isLoading]) => !isLoading && topics && topics.length === 0),
    );
    public datepickerButtonText$ = this.filter$.pipe(
        map(({ date, timeframe }) => {
            switch (timeframe) {
                case "Day":
                    return this.datePipe.transform(date, dateFormats.Day) ?? "";
                case "Week":
                    return `Week ending ${this.datePipe.transform(date, dateFormats.Day) ?? ""}`;
                case "Month":
                    return this.datePipe.transform(date, dateFormats.Month) ?? "";
                default:
                    return "";
            }
        }),
    );

    public startView$ = this.filter$.pipe(
        map(({ timeframe }) => (timeframe === "Month" ? "year" : "month")),
    );
    public isActiveTimeframe$ = this.leaderboardService.timeframeStatus$.pipe(
        map((status) => status === "Active"),
    );

    public onDateChange(date: Date | null) {
        this.leaderboardService.setDate(date);
    }

    public onTimeframeChange(timeframe: LeaderboardTimeframeExtended) {
        this.datepickerTimeframe = timeframe;
        this.leaderboardService.setTimeframe(timeframe);
    }

    public updateTimeframeStatus() {
        this.leaderboardService.updateTimeframeStatus();
    }

    public onConfirm() {
        this.isQuickDatesVisible.set(this.datepickerTimeframe === "last24Hours");
        this.datepickerTimeframes.set(
            this.isQuickDatesVisible()
                ? ["Day", "Week", "Month"]
                : ["last24Hours", "Day", "Week", "Month"],
        );
        this.leaderboardService.applyFilters();
    }

    public onQuickDateSelected({
        date,
        timeframe,
    }: {
        date: Date;
        timeframe: LeaderboardTimeframeExtended;
    }) {
        this.datepickerTimeframes.set(["Day", "Week", "Month"]);
        this.leaderboardService.setDate(date);
        this.leaderboardService.setTimeframe(timeframe);
        this.leaderboardService.applyFilters();
    }
}
