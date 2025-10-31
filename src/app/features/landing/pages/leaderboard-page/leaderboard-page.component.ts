import { Component } from "@angular/core";
import { LeaderboardComponent } from "../../ui/leaderboard/leaderboard.component";
import { ContainerComponent } from "@/app/shared/components/ui-kit/container/container.component";
import { LandingPageLayoutComponent } from "../../ui/landing-page-layout/landing-page-layout.component";

@Component({
    selector: "app-leaderboard-page",
    standalone: true,
    imports: [LeaderboardComponent, ContainerComponent, LandingPageLayoutComponent],
    templateUrl: "./leaderboard-page.component.html",
    styleUrl: "./leaderboard-page.component.scss",
})
export class LeaderboardPageComponent {}
