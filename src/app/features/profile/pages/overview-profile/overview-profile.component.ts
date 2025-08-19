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
export class OverviewProfileComponent {
    // private readonly destroyRef = inject(DestroyRef);
    // private readonly router = inject(Router);
    // private readonly settingsService = inject(SettingsService);
    // private readonly profileService = inject(ProfileService);
    // private readonly authenticationService = inject(AuthenticationService);
    // private readonly routerLoadingIndicatorService = inject(RouterLoadingIndicatorService);
    // public profile$ = this.profileService.profile$.pipe(filter((profile) => !!profile));
    // public bio$ = this.profile$.pipe(map((profile) => profile.bio));
    // public name$ = this.profile$.pipe(map((profile) => profile.name));
    // public username$ = this.profile$.pipe(map((profile) => profile.username));
    // public picture$ = this.profile$.pipe(map((profile) => profile.picture || ""));
    // public editProfileRoute = "/" + AppRoutes.Profile.EDIT;
    // public username = "";
    // public shareProfileUrl$ = this.settingsService.settings$.pipe(
    //     map((settings) => settings.shareUserBaseUrl + this.username)
    // )
    // public ngOnInit(): void {
    //     this.username$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((username) => {
    //         this.username = username;
    //     });
    // }
    // public onClickDelete() {
    //     this.router.navigateByUrl("/" + AppRoutes.Profile.DELETE_ACCOUNT);
    // }
    // public onLogout(): void {
    //     this.routerLoadingIndicatorService.setLoading(true);
    //     this.authenticationService
    //         .logout()
    //         .pipe(
    //             switchMap(() => this.authenticationService.loginAsAnonymousThroughTheFirebase()),
    //             tap(() => {
    //                 this.router.navigateByUrl("/" + AppRoutes.Landing.HOME, {
    //                     replaceUrl: true,
    //                 });
    //                 this.routerLoadingIndicatorService.setLoading(false);
    //             }),
    //             takeUntilDestroyed(this.destroyRef),
    //         )
    //         .subscribe();
    // }
    // public onCopyLink(event: MouseEvent) {
    //     event.stopPropagation();
    // }
}
