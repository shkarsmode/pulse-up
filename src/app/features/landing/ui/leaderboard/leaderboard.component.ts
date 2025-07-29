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
import { InputComponent } from "@/app/shared/components/ui-kit/input/input.component";
import { MatDatepicker, MatDatepickerModule } from "@angular/material/datepicker";
import { MAT_DATE_FORMATS } from "@angular/material/core";
import { AngularSvgIconModule } from "angular-svg-icon";


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
        InputComponent,
        DatePipe,
        AngularSvgIconModule,
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

    public get isLoading() {
        return this.leaderboardService.isLoading;
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
