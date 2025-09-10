import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
  selector: 'app-leaderboard-location-filter-empty-placeholder',
  standalone: true,
  imports: [AngularSvgIconModule],
  templateUrl: './leaderboard-location-filter-empty-placeholder.component.html',
  styleUrl: './leaderboard-location-filter-empty-placeholder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LeaderboardLocationFilterEmptyPlaceholderComponent {

}
