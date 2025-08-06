import { Component, DestroyRef, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { AngularSvgIconModule } from "angular-svg-icon";
import { MatMenuModule } from "@angular/material/menu";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { filter, map, switchMap, tap } from "rxjs";
import { UserAvatarComponent } from "../../../landing/ui/user-avatar/user-avatar.component";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { InfiniteLoaderService } from "@/app/features/landing/services/infinite-loader.service";
import { ProfileService } from "@/app/shared/services/profile/profile.service";
import { ProfileTabsComponent } from "../../ui/profile-tabs/profile-tabs.component";
import { MenuComponent } from "@/app/shared/components/ui-kit/menu/menu.component";
import { IconButtonComponent } from "@/app/shared/components/ui-kit/buttons/icon-button/icon-button.component";
import { MaterialModule } from "@/app/shared/modules/material.module";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";

@Component({
    selector: "app-review-profile",
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatMenuModule,
        UserAvatarComponent,
        PrimaryButtonComponent,
        ProfileTabsComponent,
        MenuComponent,
        IconButtonComponent,
        AngularSvgIconModule,
        MaterialModule,
    ],
    templateUrl: "./review-profile.component.html",
    styleUrl: "./review-profile.component.scss",
    providers: [InfiniteLoaderService],
})
export class ReviewProfileComponent {
    private readonly destroyRef = inject(DestroyRef);
    private readonly router = inject(Router);
    private readonly profileService = inject(ProfileService);
    private readonly authenticationService = inject(AuthenticationService);

    profile$ = this.profileService.profile$.pipe(filter((profile) => !!profile));
    bio$ = this.profile$.pipe(map((profile) => profile.bio));
    name$ = this.profile$.pipe(map((profile) => profile.name));
    username$ = this.profile$.pipe(map((profile) => profile.username));
    picture$ = this.profile$.pipe(map((profile) => profile.picture || ""));
    editProfileRoute = "/" + AppRoutes.Profile.EDIT;

    public onClickDelete() {
        this.router.navigateByUrl("/" + AppRoutes.Profile.DELETE_ACCOUNT);
    }

    public onLogout(): void {
        this.authenticationService
            .logout()
            .pipe(
                switchMap(() => this.authenticationService.loginAsAnonymousThroughTheFirebase()),
                tap(() => {
                    this.router.navigateByUrl("/" + AppRoutes.Landing.HOME, {
                        replaceUrl: true,
                    });
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe();
    }
}
