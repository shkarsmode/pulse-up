import { ProfileService } from '@/app/shared/services/profile/profile.service';
import { Component, computed, inject, signal } from "@angular/core";
import { toSignal } from '@angular/core/rxjs-interop';
import { MatTabsModule } from "@angular/material/tabs";
import { ActivatedRoute, Router } from "@angular/router";
import { filter, map } from 'rxjs';
import { HistoryTabComponent } from "./history-tab/history-tab.component";
import { MyTopicsTabComponent } from "./my-topics-tab/my-topics-tab.component";

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
    private profileService = inject(ProfileService);

    private profile$ = this.profileService.profile$.pipe(filter((profile) => !!profile));
    private name = toSignal(this.profile$.pipe(map((profile) => profile.name)));
    private username = toSignal(this.profile$.pipe(map((profile) => profile.username)));

    public isUserHasNameAndUserName = computed(() => !!this.name() && !!this.username());

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
