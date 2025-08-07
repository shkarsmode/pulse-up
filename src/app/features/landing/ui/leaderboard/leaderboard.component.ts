import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { AngularSvgIconModule } from "angular-svg-icon";
import { map, tap } from "rxjs";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { LeaderboardService } from "../../services/leaderboard.service";
import { SpinnerComponent } from "@/app/shared/components/ui-kit/spinner/spinner.component";
import { MaterialModule } from "@/app/shared/modules/material.module";
import { LinkButtonComponent } from "@/app/shared/components/ui-kit/buttons/link-button/link-button.component";
import { DialogService } from "@/app/shared/services/core/dialog.service";
import { LeaderboardTimeframe } from "../../interface/leaderboard-timeframe.interface";
import { CustomDatepickerComponent } from "../datepicker/datepicker.component";
import { LeaderboardInfoPopupComponent } from "./leaderboard-info-popup/leaderboard-info-popup.component";
import { LeaderboardListItemComponent } from "./leaderboard-list-item/leaderboard-list-item.component";
import { isCurrentTimeframeActive } from "../../helpers/isCurrentTimeframeActive";
import { getRemainingTimeToEnd } from "../../helpers/getRemainingTimeToEnd";
import { getElapsedTimePercentage } from "../../helpers/getElapsedTimePercentage";
import { ProgressBarComponent } from "./progress-bar/progress-bar.component";

dayjs.extend(duration);

const dateFormats: Record<LeaderboardTimeframe, string> = {
    Day: "MMMM d, y",
    Week: "MMMM d, y",
    Month: "MMMM y",
};

const hintLabels: Record<LeaderboardTimeframe, string> = {
    Day: "today",
    Week: "this week",
    Month: "this month",
};

@Component({
    selector: "app-leaderboard",
    standalone: true,
    imports: [
        CommonModule,
        SpinnerComponent,
        MaterialModule,
        AngularSvgIconModule,
        LinkButtonComponent,
        CustomDatepickerComponent,
        LeaderboardListItemComponent,
        ProgressBarComponent,
    ],
    providers: [DatePipe],
    templateUrl: "./leaderboard.component.html",
    styleUrl: "./leaderboard.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardComponent {
    private datePipe = inject(DatePipe);
    private dialogService = inject(DialogService);
    private leaderboardService = inject(LeaderboardService);

    public isInitialLoading = true;
    public hint = "";
    public isActiveTimerange = true;
    public elapsedTimePercentage = 0;
    public selectedDate: Date | null = this.leaderboardService.startDate;
    public selectedTimeframe = this.leaderboardService.startTimeframe;
    public topics$ = this.leaderboardService.topics$.pipe(
        tap(() => {
            this.isInitialLoading = false;
            this.updateIsActiveTimerange();
            this.updateHintText();
            this.updateElapsedTimePercentage();
        }),
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

    public get isLoading() {
        return this.isInitialLoading || this.leaderboardService.isLoading;
    }

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

    public openInfoPopup() {
        this.dialogService.open(LeaderboardInfoPopupComponent);
    }

    private updateIsActiveTimerange() {
        this.isActiveTimerange =
            !!this.selectedDate &&
            isCurrentTimeframeActive(this.selectedDate, this.selectedTimeframe);
    }

    private updateHintText() {
        if (!this.isActiveTimerange || !this.selectedDate) {
            this.hint = "Pulsing ended for this period";
            return;
        }

        const label = hintLabels[this.selectedTimeframe];
        const { days, hours, minutes } = getRemainingTimeToEnd(
            this.selectedDate,
            this.selectedTimeframe,
        );
        const parts: string[] = [];
        if (days) parts.push(`${days} days`);
        if (hours) parts.push(`${hours}h`);
        if (minutes && this.selectedTimeframe !== "Month") parts.push(`${minutes}m`);

        const timeText = parts.length > 0 ? parts.join(" ") : "0m";

        this.hint = `${timeText} remaining to pulse ${label}`;
    }

    private updateElapsedTimePercentage() {
        if (this.selectedDate) {
            this.elapsedTimePercentage = Math.ceil(
                getElapsedTimePercentage(this.selectedDate, this.selectedTimeframe),
            );
        }
    }
}
