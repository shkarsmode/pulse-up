import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { AngularSvgIconModule } from "angular-svg-icon";
import { map } from "rxjs";
import { LeaderboardService } from "../../services/leaderboard.service";
import { LargePulseComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse.component";
import { LargePulseIconComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-icon/large-pulse-icon.component";
import { LargePulseTitleComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-title/large-pulse-title.component";
import { LargePulseMetaComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-meta/large-pulse-meta.component";
import { FormatNumberPipe } from "@/app/shared/pipes/format-number.pipe";
import { SpinnerComponent } from "@/app/shared/components/ui-kit/spinner/spinner.component";
import { MaterialModule } from "@/app/shared/modules/material.module";
import { LinkButtonComponent } from "@/app/shared/components/ui-kit/buttons/link-button/link-button.component";
import { DialogService } from "@/app/shared/services/core/dialog.service";
import { LeaderboardTimeframe } from "../../interface/leaderboard-timeframe.interface";
import { CustomDatepickerComponent } from "../datepicker/datepicker.component";
import { LeaderboardInfoPopupComponent } from "./leaderboard-info-popup/leaderboard-info-popup.component";

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
        LargePulseComponent,
        LargePulseIconComponent,
        LargePulseTitleComponent,
        LargePulseMetaComponent,
        FormatNumberPipe,
        SpinnerComponent,
        MaterialModule,
        AngularSvgIconModule,
        LinkButtonComponent,
        CustomDatepickerComponent,
    ],
    providers: [DatePipe],
    templateUrl: "./leaderboard.component.html",
    styleUrl: "./leaderboard.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardComponent {
    private datePipe = inject(DatePipe);
    private leaderboardService = inject(LeaderboardService);
    private dialogService = inject(DialogService);

    // @ViewChild("picker") picker!: MatDatepicker<Date>;

    public topics$ = this.leaderboardService.topics$;
    public selectedDate: Date | null = this.leaderboardService.startDate;
    public timeframe = this.leaderboardService.startTimeframe;
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
        })
    )

    public get isLoading() {
        return this.leaderboardService.isLoading;
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
            date: this.selectedDate.toISOString(),
            timeframe: this.timeframe,
        });
    }

    public openInfoPopup() {
        this.dialogService.open(LeaderboardInfoPopupComponent)
    }
}
