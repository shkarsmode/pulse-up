import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { MatDialogRef } from "@angular/material/dialog";
import { PopupLayoutComponent } from "@/app/shared/components/ui-kit/popup/popup.component";
import { PopupSubtitleComponent } from "@/app/shared/components/ui-kit/popup/popup-subtitle/popup-subtitle.component";
import { PopupTextComponent } from "@/app/shared/components/ui-kit/popup/popup-text/popup-text.component";
import { PopupFooterComponent } from "@/app/shared/components/ui-kit/popup/popup-footer/popup-footer.component";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { PopupCloseButtonComponent } from "@/app/shared/components/ui-kit/popup/popup-close-button/popup-close-button.component";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";

@Component({
    selector: "app-sign-in-required-popup",
    standalone: true,
    imports: [
        PopupLayoutComponent,
        PopupSubtitleComponent,
        PopupTextComponent,
        PopupFooterComponent,
        PrimaryButtonComponent,
        PopupCloseButtonComponent,
    ],
    templateUrl: "./sign-in-required-popup.component.html",
    styleUrl: "./sign-in-required-popup.component.scss",
})
export class SignInRequiredPopupComponent {
    private readonly router = inject(Router);
    private readonly dialogRef = inject(MatDialogRef);

    onSignIn() {
        this.dialogRef.close();
        this.router.navigateByUrl(
            `${AppRoutes.Auth.SIGN_IN}?redirect=${this.router.url}`,
            { replaceUrl: true },
        );
    }

    onClose() {
        this.dialogRef.close();
    }
}
