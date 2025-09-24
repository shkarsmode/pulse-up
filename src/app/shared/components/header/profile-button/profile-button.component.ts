import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { MatMenuModule } from "@angular/material/menu";
import { AngularSvgIconModule } from "angular-svg-icon";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { SecondaryButtonComponent } from "../../ui-kit/buttons/secondary-button/secondary-button.component";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";

@Component({
    selector: "app-profile-button",
    standalone: true,
    imports: [SecondaryButtonComponent, AngularSvgIconModule, MatMenuModule, RouterLink],
    templateUrl: "./profile-button.component.html",
    styleUrl: "./profile-button.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileButtonComponent {
    private authenticationService = inject(AuthenticationService);

    public profileRoute = "/" + AppRoutes.Profile.OVERVIEW;
    public loginRoute = "/" + AppRoutes.Auth.SIGN_IN_WITH_PHONE;
    public get isAuthenticated(): boolean {
        return !!this.authenticationService.userTokenValue;
    }

    public logout() {
        this.authenticationService.logout();
    }
}
