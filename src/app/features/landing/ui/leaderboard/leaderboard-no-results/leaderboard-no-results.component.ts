import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NoResultsComponent } from "@/app/shared/components/no-results/no-results.component";
import { LinkButtonComponent } from "@/app/shared/components/ui-kit/buttons/link-button/link-button.component";
import { LeaderboardNoResultsService } from "./leaderboard-no-results.service";
import { ILeaderboardLocationOption } from "../../../interfaces/leaderboard-filter.interface";

@Component({
    selector: "app-leaderboard-no-results",
    standalone: true,
    imports: [CommonModule, NoResultsComponent, LinkButtonComponent],
    templateUrl: "./leaderboard-no-results.component.html",
    styleUrl: "./leaderboard-no-results.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardNoResultsComponent {
    private leaderboardNoResultsService = inject(LeaderboardNoResultsService);

    public text$ = this.leaderboardNoResultsService.noResultsText$;
    public suggestions$ = this.leaderboardNoResultsService.suggestions$;
    public onSuggestionClick(location: ILeaderboardLocationOption) {
        this.leaderboardNoResultsService.setSuggestedLocation(location);
    }
}
