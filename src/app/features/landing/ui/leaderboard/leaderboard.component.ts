import { Component, inject, ViewChild } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { LeaderboardService } from "../../services/leaderboard.service";
import { LargePulseComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse.component";
import { LargePulseIconComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-icon/large-pulse-icon.component";
import { LargePulseTitleComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-title/large-pulse-title.component";
import { LargePulseMetaComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-meta/large-pulse-meta.component";
import { FormatNumberPipe } from "@/app/shared/pipes/format-number.pipe";
import { SpinnerComponent } from "@/app/shared/components/ui-kit/spinner/spinner.component";
import { MaterialModule } from "@/app/shared/modules/material.module";
import { MatDatepicker } from "@angular/material/datepicker";
import { AngularSvgIconModule } from "angular-svg-icon";
import { LinkButtonComponent } from "@/app/shared/components/ui-kit/buttons/link-button/link-button.component";

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
        DatePipe,
        AngularSvgIconModule,
        LinkButtonComponent,
    ],
    providers: [DatePipe],
    templateUrl: "./leaderboard.component.html",
    styleUrl: "./leaderboard.component.scss",
})
export class LeaderboardComponent {
    private datePipe = inject(DatePipe);
    private leaderboardService = inject(LeaderboardService);

    @ViewChild("picker") picker!: MatDatepicker<Date>;

    public topics$ = this.leaderboardService.topics$;
    public selectedDate = new Date();
    public readonly startDate = new Date(2025, 5, 1);
    public readonly todayDate = new Date();

    public get isLoading() {
        return this.leaderboardService.isLoading;
    }

    public openCalendar() {
        this.picker.open();
    }

    public onDateChange(date: Date | null) {
        if (date) {
            this.selectedDate = date;
            const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            this.leaderboardService.setFilter({
                date: firstDay.toISOString(),
            });
        }
        this.picker.close();
    }
    get formattedDate(): string {
        return this.datePipe.transform(this.selectedDate, "MMMM yyyy") ?? "";
    }
}
