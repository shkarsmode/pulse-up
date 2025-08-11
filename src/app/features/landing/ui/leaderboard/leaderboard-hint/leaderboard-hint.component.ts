import { CommonModule } from "@angular/common";
import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    inject,
    Input,
    OnInit,
    signal,
} from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { tap } from "rxjs";
import { LeaderboardService } from "../../../services/leaderboard.service";
import { LeaderboardTimeframe } from "../../../interface/leaderboard-timeframe.interface";
import { isCurrentTimeframeActive } from "../../../helpers/isCurrentTimeframeActive";
import { getRemainingTimeToEnd } from "../../../helpers/getRemainingTimeToEnd";
import { getElapsedTimePercentage } from "../../../helpers/getElapsedTimePercentage";
import { ProgressBarComponent } from "../progress-bar/progress-bar.component";
import { LinkButtonComponent } from "@/app/shared/components/ui-kit/buttons/link-button/link-button.component";
import { DialogService } from "@/app/shared/services/core/dialog.service";
import { LeaderboardInfoPopupComponent } from "../leaderboard-info-popup/leaderboard-info-popup.component";
import { isTimeframeInFutureUTC } from "../../../helpers/isTimeframeInFuture";

const hintLabels: Record<LeaderboardTimeframe, string> = {
    Day: "today",
    Week: "this week",
    Month: "this month",
};

@Component({
    selector: "app-leaderboard-hint",
    standalone: true,
    imports: [CommonModule, ProgressBarComponent, LinkButtonComponent, AngularSvgIconModule],
    templateUrl: "./leaderboard-hint.component.html",
    styleUrl: "./leaderboard-hint.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardHintComponent implements OnInit {
    @Input() public selectedDate: Date | null;
    @Input() public selectedTimeframe: LeaderboardTimeframe;

    private destroyRef = inject(DestroyRef);
    private dialogService = inject(DialogService);
    private leaderboardService = inject(LeaderboardService);

    public hint = signal("");
    public isActiveTimerange = true;
    public elapsedTimePercentage = 0;

    public ngOnInit() {
        this.leaderboardService.topics$
            .pipe(
                tap((topics) => {
                    if (topics) {
                        this.updateIsActiveTimerange();
                        this.updateHintText();
                        this.updateElapsedTimePercentage();
                    } else {
                        this.hint.set("");
                    }
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
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
        if (!this.selectedDate) {
            this.hint.set("Pulsing ended for this period");
            return;
        }

        if (!this.isActiveTimerange && isTimeframeInFutureUTC(this.selectedDate)) {
            this.hint.set("Pulsing for this period hasn't started");
            return;
        }

        if (!this.isActiveTimerange) {
            this.hint.set("Pulsing ended for this period");
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

        this.hint.set(`${timeText} remaining to pulse ${label}`);
    }

    private updateElapsedTimePercentage() {
        if (this.selectedDate) {
            this.elapsedTimePercentage = Math.ceil(
                getElapsedTimePercentage(this.selectedDate, this.selectedTimeframe),
            );
        }
    }
}
