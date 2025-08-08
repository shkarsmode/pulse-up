import { Component, DestroyRef, inject, OnInit } from "@angular/core";
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
import { RouterLoadingIndicatorService } from "@/app/shared/components/router-loading-indicator/router-loading-indicator.service";
import { CopyButtonComponent } from "@/app/shared/components/ui-kit/buttons/copy-button/copy-button.component";
import { SocialsButtonComponent } from "@/app/shared/components/ui-kit/buttons/socials-button/socials-button.component";
import { QrcodeButtonComponent } from "@/app/shared/components/ui-kit/buttons/qrcode-button/qrcode-button.component";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { FlatButtonDirective } from "@/app/shared/components/ui-kit/buttons/flat-button/flat-button.directive";
import { LinkifyPipe } from "@/app/shared/pipes/linkify.pipe";

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
        CopyButtonComponent,
        SocialsButtonComponent,
        QrcodeButtonComponent,
        FlatButtonDirective,
        LinkifyPipe,
    ],
    templateUrl: "./overview-profile.component.html",
    styleUrl: "./overview-profile.component.scss",
    providers: [InfiniteLoaderService],
})
export class OverviewProfileComponent implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
    private readonly router = inject(Router);
    private readonly settingsService = inject(SettingsService);
    private readonly profileService = inject(ProfileService);
    private readonly authenticationService = inject(AuthenticationService);
    private readonly routerLoadingIndicatorService = inject(RouterLoadingIndicatorService);

    public profile$ = this.profileService.profile$.pipe(filter((profile) => !!profile));
    public bio$ = this.profile$.pipe(map((profile) => profile.bio));
    public name$ = this.profile$.pipe(map((profile) => profile.name));
    public username$ = this.profile$.pipe(map((profile) => profile.username));
    public picture$ = this.profile$.pipe(map((profile) => profile.picture || ""));
    public editProfileRoute = "/" + AppRoutes.Profile.EDIT;

    public username = "";

    public get shareProfileUrl(): string {
        return this.settingsService.shareUserBaseUrl + this.username;
    }

    public ngOnInit(): void {
        this.username$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((username) => {
            this.username = username;
        });
    }

    public onClickDelete() {
        this.router.navigateByUrl("/" + AppRoutes.Profile.DELETE_ACCOUNT);
    }

    public onLogout(): void {
        this.routerLoadingIndicatorService.setLoading(true);
        this.authenticationService
            .logout()
            .pipe(
                switchMap(() => this.authenticationService.loginAsAnonymousThroughTheFirebase()),
                tap(() => {
                    this.router.navigateByUrl("/" + AppRoutes.Landing.HOME, {
                        replaceUrl: true,
                    });
                    this.routerLoadingIndicatorService.setLoading(false);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    public onCopyLink(event: MouseEvent) {
        event.stopPropagation();
    }
}
