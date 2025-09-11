import {
    ChangeDetectionStrategy,
    Component,
    signal,
    OnInit,
    OnDestroy,
    computed,
} from "@angular/core";
import dayjs from "dayjs";

@Component({
    selector: "app-leaderboard-current-utc",
    standalone: true,
    imports: [],
    templateUrl: "./leaderboard-current-utc.component.html",
    styleUrl: "./leaderboard-current-utc.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardCurrentUtcComponent implements OnInit, OnDestroy {
    private intervalId: NodeJS.Timeout;
    private currentTime = signal(new Date());

    public currentUtc = computed(() => {
        return dayjs(this.currentTime()).utc().format("[Now:] MMM D, YYYY, h:mm A [UTC]");
    });

    ngOnInit() {
        this.intervalId = setInterval(() => {
            this.currentTime.set(new Date());
        }, 1000);
    }

    ngOnDestroy() {
        clearInterval(this.intervalId);
    }
}
