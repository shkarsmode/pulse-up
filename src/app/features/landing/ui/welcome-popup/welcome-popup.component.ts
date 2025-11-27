import { AuthDisclaimerComponent } from "@/app/shared/components/auth-disclaimer/auth-disclaimer.component";
import { AuthFormComponent } from "@/app/shared/components/auth-form/auth-form.component";
import { PopupCloseButtonComponent } from "@/app/shared/components/ui-kit/popup/popup-close-button/popup-close-button.component";
import { PopupSubtitleComponent } from "@/app/shared/components/ui-kit/popup/popup-subtitle/popup-subtitle.component";
import { PopupTextComponent } from "@/app/shared/components/ui-kit/popup/popup-text/popup-text.component";
import { PopupLayoutComponent } from "@/app/shared/components/ui-kit/popup/popup.component";
import { SignInFormService } from "@/app/shared/services/core/sign-in-form.service";
import { VotingService } from "@/app/shared/services/votes/voting.service";
import { Component, inject } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { MatTooltipModule } from '@angular/material/tooltip';
import { delay, take } from "rxjs";

@Component({
    selector: "app-welcome-popup",
    standalone: true,
    imports: [
        PopupLayoutComponent,
        PopupCloseButtonComponent,
        PopupSubtitleComponent,
        AuthFormComponent,
        PopupTextComponent,
        AuthDisclaimerComponent,
        MatTooltipModule
    ],
    templateUrl: "./welcome-popup.component.html",
    styleUrl: "./welcome-popup.component.scss",
    providers: [SignInFormService],
})
export class WelcomePopupComponent {
    private readonly dialogRef = inject(MatDialogRef<WelcomePopupComponent>);
    private readonly votingService = inject(VotingService);

    public readonly phoneTooltip: string =
        "🛡 Real & Fair: Verification ensures one person, one vote. This keeps the map honest and bot-free.\n" +
        "👻 Publicly Anonymous: Your support counts, but your identity is hidden. Only you can see your own history.\n" +
        "🔒 Strictly Secure: We use your number for login authentication only. No marketing, no spam, ever.";

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
