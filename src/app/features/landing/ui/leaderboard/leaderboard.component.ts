import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { AngularSvgIconModule } from "angular-svg-icon";
import { map, tap } from "rxjs";
import { LeaderboardService } from "../../services/leaderboard.service";
import { SpinnerComponent } from "@/app/shared/components/ui-kit/spinner/spinner.component";
import { MaterialModule } from "@/app/shared/modules/material.module";
import { LinkButtonComponent } from "@/app/shared/components/ui-kit/buttons/link-button/link-button.component";
import { DialogService } from "@/app/shared/services/core/dialog.service";
import { LeaderboardTimeframe } from "../../interface/leaderboard-timeframe.interface";
import { CustomDatepickerComponent } from "../datepicker/datepicker.component";
import { LeaderboardInfoPopupComponent } from "./leaderboard-info-popup/leaderboard-info-popup.component";
import { LeaderboardListItemComponent } from "./leaderboard-list-item/leaderboard-list-item.component";

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
        LinkButtonComponent,
        CustomDatepickerComponent,
        LeaderboardListItemComponent,
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
    public selectedDate: Date | null = this.leaderboardService.startDate;
    public timeframe = this.leaderboardService.startTimeframe;
    public topics$ = this.leaderboardService.topics$.pipe(
        tap(() => (this.isInitialLoading = false)),
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
        return this.timeframe === "Month" ? "year" : "month";
    }

    public onDateSelected(date: Date | null) {
        this.selectedDate = date;
    }

    public onTimeframeChange(timeframe: LeaderboardTimeframe) {
        this.timeframe = timeframe;
    }

    public onConfirm() {
        if (!this.selectedDate) return;
        this.leaderboardService.setFilter({
            date: this.selectedDate.toDateString(),
            timeframe: this.timeframe,
        });
    }

    public openInfoPopup() {
        this.dialogService.open(LeaderboardInfoPopupComponent);
    }
}
