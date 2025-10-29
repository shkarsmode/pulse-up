import { Component, inject, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MatTabsModule } from "@angular/material/tabs";
import { MyTopicsTabComponent } from "./my-topics-tab/my-topics-tab.component";
import { HistoryTabComponent } from "./history-tab/history-tab.component";

@Component({
    selector: "app-profile-tabs",
    standalone: true,
    imports: [MatTabsModule, MyTopicsTabComponent, HistoryTabComponent],
    templateUrl: "./profile-tabs.component.html",
    styleUrl: "./profile-tabs.component.scss",
})
export class ProfileTabsComponent {
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    public selectedTabIndex = signal(0);

    constructor() {
        const tabFromUrl = Number(this.route.snapshot.queryParamMap.get("tab"));
        this.selectedTabIndex.set(isNaN(tabFromUrl) ? 0 : tabFromUrl);
    }

    public onTabChange(index: number): void {
        this.router.navigate([], {
            queryParams: { tab: index },
            queryParamsHandling: "merge",
            replaceUrl: true,
        });
    }
}
