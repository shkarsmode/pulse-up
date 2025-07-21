import { Component, inject } from "@angular/core";
import { delay, take } from "rxjs";
import { MatDialogRef } from "@angular/material/dialog";
import { AuthFormComponent } from "@/app/shared/components/auth-form/auth-form.component";
import { PopupCloseButtonComponent } from "@/app/shared/components/ui-kit/popup/popup-close-button/popup-close-button.component";
import { PopupSubtitleComponent } from "@/app/shared/components/ui-kit/popup/popup-subtitle/popup-subtitle.component";
import { PopupTextComponent } from "@/app/shared/components/ui-kit/popup/popup-text/popup-text.component";
import { PopupLayoutComponent } from "@/app/shared/components/ui-kit/popup/popup.component";
import { SignInFormService } from "@/app/shared/services/core/sign-in-form.service";
import { VotingService } from "@/app/shared/services/core/voting.service";

@Component({
    selector: "app-welcome-popup",
    standalone: true,
    imports: [
        PopupLayoutComponent,
        PopupCloseButtonComponent,
        PopupSubtitleComponent,
        AuthFormComponent,
        PopupTextComponent,
    ],
    templateUrl: "./welcome-popup.component.html",
    styleUrl: "./welcome-popup.component.scss",
    providers: [SignInFormService],
})
export class WelcomePopupComponent {
    private readonly dialogRef = inject(MatDialogRef<WelcomePopupComponent>);
    private readonly votingService = inject(VotingService);

    onClose() {
        this.dialogRef.close({
            stopSignInProcess: true,
        });
    }

    onSubmit() {
        this.dialogRef.close();
        this.dialogRef
            .afterClosed()
            .pipe(take(1), delay(250))
            .subscribe(() => {
                this.votingService.confirmPhoneNumber();
            });
    }
}
