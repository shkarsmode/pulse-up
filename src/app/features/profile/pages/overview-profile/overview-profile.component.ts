import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MatMenuModule } from "@angular/material/menu";
import { InfiniteLoaderService } from "@/app/features/landing/services/infinite-loader.service";
import { ProfileTabsComponent } from "../../ui/profile-tabs/profile-tabs.component";
import { ProfileCardComponent } from "../../ui/profile-card/profile-card.component";

@Component({
    selector: "app-review-profile",
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatMenuModule,
        ProfileTabsComponent,
        ProfileCardComponent,
    ],
    templateUrl: "./overview-profile.component.html",
    styleUrl: "./overview-profile.component.scss",
    providers: [InfiniteLoaderService],
})
export class OverviewProfileComponent {}
