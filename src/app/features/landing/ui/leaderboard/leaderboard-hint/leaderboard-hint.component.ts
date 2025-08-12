import { CommonModule } from "@angular/common";
import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    EventEmitter,
    inject,
    Input,
    OnInit,
    Output,
    signal,
} from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { interval, tap } from "rxjs";
import { LeaderboardService } from "../../../services/leaderboard.service";
import { LeaderboardTimeframe } from "../../../interface/leaderboard-timeframe.interface";
import { getRemainingTimeToEnd } from "../../../helpers/getRemainingTimeToEnd";
import { getElapsedTimePercentage } from "../../../helpers/getElapsedTimePercentage";
import { ProgressBarComponent } from "../progress-bar/progress-bar.component";
import { LinkButtonComponent } from "@/app/shared/components/ui-kit/buttons/link-button/link-button.component";
import { DialogService } from "@/app/shared/services/core/dialog.service";
import { LeaderboardInfoPopupComponent } from "../leaderboard-info-popup/leaderboard-info-popup.component";
import { TimeframeStatus } from "../../../interface/timeframe-status.interface";

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
    @Input() public timeframeStatus: TimeframeStatus;

    @Output() public counterStopped = new EventEmitter<void>();

    private destroyRef = inject(DestroyRef);
    private dialogService = inject(DialogService);
    private leaderboardService = inject(LeaderboardService);

    public isVisible = signal(false);
    public remainingTime = signal(0);
    public elapsedTimePercentage = 0;
    public labels: Record<LeaderboardTimeframe, string> = {
        Day: "today",
        Week: "this week",
        Month: "this month",
    };

    public ngOnInit() {
        this.leaderboardService.topics$
            .pipe(
                tap((topics) => {
                    if (topics) {
                        this.updateRemainingTime();
                        this.updateElapsedTimePercentage();
                        this.isVisible.set(true);
                    } else {
                        this.isVisible.set(false);
                    }
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    public openInfoPopup() {
        this.dialogService.open(LeaderboardInfoPopupComponent, {
            data: {
                timeframe: this.selectedTimeframe,
                status: this.timeframeStatus,
            },
        });
    }

    public formatTime(ms: number) {
        const minutesTotal = Math.floor(ms / (1000 * 60));
        const days = Math.floor(minutesTotal / (60 * 24));
        const hours = Math.floor((minutesTotal % (60 * 24)) / 60);
        const minutes = minutesTotal % 60;
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);

        const parts: string[] = [];
        if (days) parts.push(`${days} days`);
        if (hours) parts.push(`${hours}h`);
        if (this.selectedTimeframe !== "Month") parts.push(`${minutes}m`);
        if (this.selectedTimeframe !== "Month") parts.push(`${seconds}s`);

        return parts.length > 0 ? parts.join(" ") : "0h 0m";
    }

    private updateRemainingTime() {
        if (this.timeframeStatus !== "Active" || !this.selectedDate) {
            this.remainingTime.set(0);
            return;
        }
        this.remainingTime.set(getRemainingTimeToEnd(this.selectedDate, this.selectedTimeframe));
        this.startCounter();
    }

    private updateElapsedTimePercentage() {
        if (this.timeframeStatus === "Active" && this.selectedDate) {
            this.elapsedTimePercentage = Math.ceil(
                getElapsedTimePercentage(this.selectedDate, this.selectedTimeframe),
            );
        }
    }

    private startCounter() {
        interval(1000)
            .pipe(
                tap(() => {
                    const time = this.remainingTime() - 1000;
                    if (time <= 0) {
                        this.remainingTime.set(0);
                        this.counterStopped.emit();
                        return;
                    }
                    this.remainingTime.set(time);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }
}
