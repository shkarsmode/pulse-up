import { Component, inject } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";
import { CloseButtonComponent } from "../../ui-kit/buttons/close-button/close-button.component";
import { PrimaryButtonComponent } from "../../ui-kit/buttons/primary-button/primary-button.component";

@Component({
    selector: "app-signin-required-popup",
    standalone: true,
    imports: [CloseButtonComponent, PrimaryButtonComponent],
    templateUrl: "./signin-required-popup.component.html",
    styleUrl: "./signin-required-popup.component.scss",
})
export class SigninRequiredPopupComponent {
    private readonly authenticationService = inject(AuthenticationService);
    private readonly dialogRef: MatDialogRef<SigninRequiredPopupComponent> = inject(MatDialogRef);

    public onCloseDialog(): void {
        this.dialogRef.close();
    }

    public logout(): void {
        this.dialogRef.close();
        this.authenticationService.logout({
            redirectUrl: `/${AppRoutes.Auth.SIGN_IN_WITH_PHONE}?redirect=${AppRoutes.Profile.CHANGE_EMAIL}`,
        });
    }
}
