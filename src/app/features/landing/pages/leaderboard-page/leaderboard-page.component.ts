import { Component } from "@angular/core";
import { LeaderboardComponent } from "../../ui/leaderboard/leaderboard.component";
import { ContainerComponent } from "@/app/shared/components/ui-kit/container/container.component";
import { LendingPageLayoutComponent } from "../../ui/lending-page-layout/lending-page-layout.component";

@Component({
    selector: "app-leaderboard-page",
    standalone: true,
    imports: [LeaderboardComponent, ContainerComponent, LendingPageLayoutComponent],
    templateUrl: "./leaderboard-page.component.html",
    styleUrl: "./leaderboard-page.component.scss",
})
export class LeaderboardPageComponent {}
