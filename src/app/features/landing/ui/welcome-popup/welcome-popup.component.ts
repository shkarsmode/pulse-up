import { Component, inject } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { PopupLayoutComponent } from "@/app/shared/components/ui-kit/popup/popup.component";
import { PopupCloseButtonComponent } from "@/app/shared/components/ui-kit/popup/popup-close-button/popup-close-button.component";
import { PopupSubtitleComponent } from "@/app/shared/components/ui-kit/popup/popup-subtitle/popup-subtitle.component";
import { AuthFormComponent } from "../../../../shared/components/auth-form/auth-form.component";
import { SignInFormService } from "@/app/shared/services/core/sign-in-form.service";
import { ConfirmPhoneNumberPopupComponent } from "../confirm-phone-number-popup/confirm-phone-number-popup.component";

@Component({
    selector: "app-welcome-popup",
    standalone: true,
    imports: [
        PopupLayoutComponent,
        PopupCloseButtonComponent,
        PopupSubtitleComponent,
        AuthFormComponent,
    ],
    templateUrl: "./welcome-popup.component.html",
    styleUrl: "./welcome-popup.component.scss",
    providers: [SignInFormService],
})
export class WelcomePopupComponent {
    private readonly dialogRef = inject(MatDialogRef<WelcomePopupComponent>);
    private readonly dialog = inject(MatDialog);

    onClose() {
        this.dialogRef.close();
    }

    onSubmit() {
        this.dialogRef.close();
        setTimeout(() => {
            this.dialog.open(ConfirmPhoneNumberPopupComponent, {
                width: "500px",
                panelClass: "custom-dialog-container",
                backdropClass: "custom-dialog-backdrop",
            });
        });
    }
}
