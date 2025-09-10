import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

@Component({
    selector: "app-leaderboard-location-option-skeleton",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./leaderboard-location-option-skeleton.component.html",
    styleUrl: "./leaderboard-location-option-skeleton.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardLocationOptionSkeletonComponent {
    @Input() width = "100%";
}
