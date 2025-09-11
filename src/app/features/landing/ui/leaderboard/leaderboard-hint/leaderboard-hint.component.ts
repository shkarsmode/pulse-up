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
import { LeaderboardService } from "../leaderboard.service";
import { LeaderboardTimeframe, LeaderboardTimeframeStatus } from "@/app/shared/interfaces";
import { getRemainingTimeToEnd } from "../../../helpers/getRemainingTimeToEnd";
import { getElapsedTimePercentage } from "../../../helpers/getElapsedTimePercentage";
import { ProgressBarComponent } from "../progress-bar/progress-bar.component";
import { LinkButtonComponent } from "@/app/shared/components/ui-kit/buttons/link-button/link-button.component";
import { DialogService } from "@/app/shared/services/core/dialog.service";
import { LeaderboardInfoPopupComponent } from "../leaderboard-info-popup/leaderboard-info-popup.component";
import { formatRemainingTime } from "../../../helpers/formatRemainingTime";
import { LeaderboardCurrentUtcComponent } from "./leaderboard-current-utc/leaderboard-current-utc.component";
import { isUtcNextDay } from "../../../helpers/isUtcNextDay";

@Component({
    selector: "app-leaderboard-hint",
    standalone: true,
    imports: [CommonModule, ProgressBarComponent, LinkButtonComponent, AngularSvgIconModule, LeaderboardCurrentUtcComponent],
    templateUrl: "./leaderboard-hint.component.html",
    styleUrl: "./leaderboard-hint.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardHintComponent implements OnInit {
    @Input() public selectedDate: Date | null;
    @Input() public selectedTimeframe: LeaderboardTimeframe;
    @Input() public timeframeStatus: LeaderboardTimeframeStatus;

    @Output() public counterStopped = new EventEmitter<void>();

    private destroyRef = inject(DestroyRef);
    private dialogService = inject(DialogService);
    private leaderboardService = inject(LeaderboardService);

    private tickCount = 0;

    public isVisible = signal(false);
    public remainingTime = signal(0);
    public elapsedTimePercentage = signal(0);
    public labels: Record<LeaderboardTimeframe, string> = {
        Day: "today",
        Week: "this week",
        Month: "this month",
    };
    public isUTCNextDay = false;

    public get isDayFormat() {
        return this.selectedTimeframe !== "Month";
    }

    public ngOnInit() {
        this.isUTCNextDay = isUtcNextDay();
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
            width: "600px",
            data: {
                timeframe: this.selectedTimeframe,
                status: this.timeframeStatus,
            },
        });
    }

    public formatTime(ms: number) {
        return formatRemainingTime(ms, this.selectedTimeframe);
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
            this.elapsedTimePercentage.set(
                Math.ceil(getElapsedTimePercentage(this.selectedDate, this.selectedTimeframe)),
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
                    
                    this.tickCount++;
                    if (this.tickCount % 60 === 0) {
                        this.updateElapsedTimePercentage();
                    }
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }
}
