import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MatMenuModule } from "@angular/material/menu";
import { AngularSvgIconModule } from "angular-svg-icon";
import { combineLatest, filter, map } from "rxjs";
import { LinkifyPipe } from "@/app/shared/pipes/linkify.pipe";
import { ProfileService } from "@/app/shared/services/profile/profile.service";
import { UserAvatarComponent } from "@/app/features/landing/ui/user-avatar/user-avatar.component";
import { FabButtonComponent } from "@/app/shared/components/ui-kit/buttons/fab-button/fab-button.component";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { CopyButtonComponent } from "@/app/shared/components/ui-kit/buttons/copy-button/copy-button.component";
import { SocialsButtonComponent } from "@/app/shared/components/ui-kit/buttons/socials-button/socials-button.component";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { QrcodeButtonComponent } from "@/app/shared/components/ui-kit/buttons/qrcode-button/qrcode-button.component";
import { MenuComponent } from "@/app/shared/components/ui-kit/menu/menu.component";

@Component({
    selector: "app-profile-card",
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatMenuModule,
        AngularSvgIconModule,
        UserAvatarComponent,
        LinkifyPipe,
        FabButtonComponent,
        CopyButtonComponent,
        SocialsButtonComponent,
        QrcodeButtonComponent,
        MenuComponent,
    ],
    templateUrl: "./profile-card.component.html",
    styleUrl: "./profile-card.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileCardComponent {
    private profileService = inject(ProfileService);
    private settingsService = inject(SettingsService);
    private authenticationService = inject(AuthenticationService);

    private profile$ = this.profileService.profile$.pipe(filter((profile) => !!profile));
    public bio$ = this.profile$.pipe(map((profile) => profile.bio));
    public name$ = this.profile$.pipe(map((profile) => profile.name));
    public username$ = this.profile$.pipe(map((profile) => profile.username));
    public picture$ = this.profile$.pipe(map((profile) => profile.picture || ""));
    public shareProfileUrl$ = combineLatest([this.settingsService.settings$, this.username$]).pipe(
        map(([settings, username]) => settings.shareUserBaseUrl + username),
    );
    public editProfileRoute = "/" + AppRoutes.Profile.EDIT;
    public deleteAccountRoute = "/" + AppRoutes.Profile.DELETE_ACCOUNT;

    public logout() {
        this.authenticationService.logout()
    }
    public onCopyLink(event: MouseEvent) {
        event.stopPropagation();
    }
}
