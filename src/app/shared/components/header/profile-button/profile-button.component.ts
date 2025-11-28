import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";
import { VotingService } from '@/app/shared/services/votes/voting.service';
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MatMenuModule } from "@angular/material/menu";
import { RouterLink } from "@angular/router";
import { AngularSvgIconModule } from "angular-svg-icon";
import { SecondaryButtonComponent } from "../../ui-kit/buttons/secondary-button/secondary-button.component";

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
    private votingService = inject(VotingService);

    public profileRoute = "/" + AppRoutes.Profile.OVERVIEW;
    public loginRoute = "/" + AppRoutes.Auth.SIGN_IN_WITH_PHONE;
    public get isAuthenticated(): boolean {
        return !!this.authenticationService.userTokenValue;
    }

    public onProfileButtonClick(): void {
        if (this.isAuthenticated) return;

        this.votingService.showWelcomePopup();
    }

    public logout() {
        this.authenticationService.logout();
    }
}
