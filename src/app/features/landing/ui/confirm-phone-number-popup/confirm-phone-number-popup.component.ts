import { Component, inject } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { ConfirmPhoneNumberService } from "@/app/shared/services/core/confirm-phone-number.service";
import { ConfirmPhoneNumberFormComponent } from "@/app/shared/components/confirm-phone-number-form/confirm-phone-number-form.component";
import { PopupLayoutComponent } from "@/app/shared/components/ui-kit/popup/popup.component";
import { PopupCloseButtonComponent } from "@/app/shared/components/ui-kit/popup/popup-close-button/popup-close-button.component";
import {
    AuthenticationError,
    AuthenticationErrorCode,
} from "@/app/shared/helpers/errors/authentication-error";
import { NotificationService } from "@/app/shared/services/core/notification.service";
import { isErrorWithMessage } from "@/app/shared/helpers/errors/is-error-with-message";
import { VotingService } from "@/app/shared/services/core/voting.service";
import { PopupBackButtonComponent } from "@/app/shared/components/ui-kit/popup/popup-back-button/popup-back-button.component";

@Component({
    selector: "app-confirm-phone-number-popup",
    standalone: true,
    imports: [
        ConfirmPhoneNumberFormComponent,
        PopupLayoutComponent,
        PopupCloseButtonComponent,
        PopupBackButtonComponent,
    ],
    providers: [ConfirmPhoneNumberService],
    templateUrl: "./confirm-phone-number-popup.component.html",
    styleUrl: "./confirm-phone-number-popup.component.scss",
})
export class ConfirmPhoneNumberPopupComponent {
    private readonly dialogRef = inject(MatDialogRef<ConfirmPhoneNumberPopupComponent>);
    private readonly notificationService = inject(NotificationService);
    private readonly votingService = inject(VotingService);

    public closeDialog() {
        this.hideRecaptcha();
        this.dialogRef.close();
    }

    public onCodeConfirm() {
        this.closeDialog();
        this.notificationService.success("You have successfully logged in.");
        this.votingService.setIsAnonymousUserSignedIn(true);
    }

    public onError = (error: unknown) => {
        if (error instanceof AuthenticationError) {
            if (
                error.code === AuthenticationErrorCode.INVALID_CREDENTIALS ||
                error.code === AuthenticationErrorCode.INVALID_RECAPTCHA
            ) {
                this.notificationService.error("Invalid confirmation code. Please try again.");
                this.closeDialog();
                return;
            } else if (error.code === AuthenticationErrorCode.REAUTHENTICATE) {
                this.votingService.reauthenticate();
                return;
            }
        }
        const message = isErrorWithMessage(error)
            ? error.message
            : "Failed to confirm phone number. Please try again.";
        this.notificationService.error(message);
    };

    public back() {
        this.closeDialog();
        this.votingService.backToWelcomePopup();
    }

    private hideRecaptcha() {
        const recaptchaContainer = document.getElementById("recaptcha-container");
        if (recaptchaContainer) {
            recaptchaContainer.innerHTML = "";
        }
    }
}
