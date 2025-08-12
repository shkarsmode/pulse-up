import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    inject,
    Input,
    Output,
    OnInit,
    OnDestroy,
    DestroyRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { interval, map, Subscription, tap } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { IVote } from "@/app/shared/interfaces/vote.interface";
import { SettingsService } from "@/app/shared/services/api/settings.service";

@Component({
    selector: "app-vote-time-left",
    standalone: true,
    imports: [CommonModule],
    template: ` <span>{{ time }}</span> `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoteTimeLeftComponent implements OnInit, OnDestroy {
    @Input() vote: IVote;
    @Output() expired = new EventEmitter<void>();

    private cdr = inject(ChangeDetectorRef);
    private destroyRef = inject(DestroyRef);
    private settingsService = inject(SettingsService);

    private timerSub?: Subscription;
    private intervalMinutes = 1440;
    public time = "";

    ngOnInit(): void {
        this.settingsService.settings$
            .pipe(
                map((settings) => settings.minVoteInterval),
                tap((interval) => (this.intervalMinutes = interval)),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe();

        this.updateTimeLeft();
        this.timerSub = interval(1000).subscribe(() => {
            this.updateTimeLeft();
        });
    }

    ngOnDestroy(): void {
        this.timerSub?.unsubscribe();
    }

    private updateTimeLeft() {
        const updatedAt = new Date(this.vote.updatedAt).getTime();
        const now = Date.now();
        const msPassed = now - updatedAt;
        const msTotal = this.intervalMinutes * 60 * 1000;
        const msLeft = Math.max(msTotal - msPassed, 0);

        if (msLeft === 0) {
            this.expired.emit();
            this.time = "";
            this.timerSub?.unsubscribe();
            return;
        }

        const totalMinutes = Math.floor(msLeft / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const seconds = Math.floor((msLeft % (1000 * 60)) / 1000);

        this.time = `${hours}h ${minutes}m ${seconds}s`;
        this.cdr.markForCheck();
    }
}
