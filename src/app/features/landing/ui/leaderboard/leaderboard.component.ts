import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { AngularSvgIconModule } from "angular-svg-icon";
import { combineLatest, map } from "rxjs";
import { LeaderboardService } from "../../services/leaderboard.service";
import { SpinnerComponent } from "@/app/shared/components/ui-kit/spinner/spinner.component";
import { MaterialModule } from "@/app/shared/modules/material.module";
import { LeaderboardTimeframe } from "../../interface/leaderboard-timeframe.interface";
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
        MaterialModule,
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

    private isLoadingTopics$ = this.leaderboardService.isLoading$;
    private isErrorTopics$ = this.leaderboardService.isError$;
    public selectedDate: Date | null = this.leaderboardService.startDate;
    public selectedTimeframe = this.leaderboardService.startTimeframe;
    public topics$ = this.leaderboardService.topics$;
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
    public datepickerButtonText$ = this.leaderboardService.filter$.pipe(
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

    public get startView() {
        return this.selectedTimeframe === "Month" ? "year" : "month";
    }

    public onDateSelected(date: Date | null) {
        this.selectedDate = date;
    }

    public onTimeframeChange(timeframe: LeaderboardTimeframe) {
        this.selectedTimeframe = timeframe;
    }

    public onConfirm() {
        if (!this.selectedDate) return;
        this.leaderboardService.setFilter({
            date: this.selectedDate.toDateString(),
            timeframe: this.selectedTimeframe,
        });
    }
}
