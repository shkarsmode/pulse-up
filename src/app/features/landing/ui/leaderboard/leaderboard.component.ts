import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { AngularSvgIconModule } from "angular-svg-icon";
import { combineLatest, map } from "rxjs";
import { LeaderboardService } from "../../services/leaderboard.service";
import { SpinnerComponent } from "@/app/shared/components/ui-kit/spinner/spinner.component";
import { LeaderboardTimeframe } from "@/app/shared/interfaces";
import { CustomDatepickerComponent } from "../datepicker/datepicker.component";
import { LeaderboardListItemComponent } from "./leaderboard-list-item/leaderboard-list-item.component";
import { LeaderboardHintComponent } from "./leaderboard-hint/leaderboard-hint.component";

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
    private isLoadingTopics$ = this.leaderboardService.isLoading$;
    private isErrorTopics$ = this.leaderboardService.isError$;

    public topics$ = this.leaderboardService.topics$;
    public timeframeStatus$ = this.leaderboardService.timeframeStatus$;
    public date$ = this.filter$.pipe(
        map((filter) => filter.date),
    );
    public tempDate$ = this.tempFilter$.pipe(
        map((tempFilter) => tempFilter.date),
    );
    public timeframe$ = this.filter$.pipe(
        map((filter) => filter.timeframe),
    );
    public tempTimeframe$ = this.tempFilter$.pipe(
        map((tempFilter) => tempFilter.timeframe),
    );

    public isSpinnerVisible$ = combineLatest([this.isLoadingTopics$, this.isErrorTopics$]).pipe(
        map(([isLoading, isError]) => isLoading && !isError),
    );
    public isContentVisible$ = combineLatest([
        this.isLoadingTopics$,
        this.isErrorTopics$,
        this.topics$,
    ]).pipe(
        map(
            ([isLoading, isError, topics]) => !isLoading && !isError && topics && topics.length > 0,
        ),
    );
    public isErrorVisible$ = combineLatest([this.isLoadingTopics$, this.isErrorTopics$]).pipe(
        map(([isLoading, isError]) => !isLoading && isError),
    );
    public isEmpty$ = combineLatest([this.topics$, this.isLoadingTopics$]).pipe(
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

    public onTimeframeChange(timeframe: LeaderboardTimeframe) {
        this.leaderboardService.setTimeframe(timeframe);
    }

    public updateTimeframeStatus() {
        this.leaderboardService.updateTimeframeStatus();
    }

    public onConfirm() {
        this.leaderboardService.applyFilters();
    }
}
