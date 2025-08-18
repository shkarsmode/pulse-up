import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { LeaderboardDateButtonComponent } from "../leaderboard-date-button/leaderboard-date-button.component";
import { LeaderboardTimeframeExtended } from "@/app/shared/interfaces";
import dayjs from "dayjs";

@Component({
    selector: "app-leaderboard-quick-dates",
    standalone: true,
    imports: [LeaderboardDateButtonComponent],
    templateUrl: "./leaderboard-quick-dates.component.html",
    styleUrl: "./leaderboard-quick-dates.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardQuickDatesComponent {
    @Input() timeframe: LeaderboardTimeframeExtended;

    @Output() selected = new EventEmitter<{
        date: Date;
        timeframe: LeaderboardTimeframeExtended;
    }>();

    public onClick(timeframe: LeaderboardTimeframeExtended) {
        switch (timeframe) {
            case "last24Hours":
            case "Day":
                this.selected.emit({
                    date: new Date(),
                    timeframe: "last24Hours",
                });
                break;
            case "Week":
                this.selected.emit({
                    date: dayjs().endOf("week").toDate(),
                    timeframe,
                });
                break;
            case "Month":
                this.selected.emit({
                    date: dayjs().endOf("month").toDate(),
                    timeframe,
                });
                break;
        }
    }
}
