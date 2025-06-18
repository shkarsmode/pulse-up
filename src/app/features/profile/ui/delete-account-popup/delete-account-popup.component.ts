import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { MatDialogRef } from "@angular/material/dialog";
import { catchError, switchMap, take, tap, throwError } from "rxjs";
import { PopupLayoutComponent } from "@/app/shared/components/ui-kit/popup/popup.component";
import { PopupTitleComponent } from "@/app/shared/components/ui-kit/popup/popup-title/popup-title.component";
import { PopupTextComponent } from "@/app/shared/components/ui-kit/popup/popup-text/popup-text.component";
import { PopupFooterComponent } from "@/app/shared/components/ui-kit/popup/popup-footer/popup-footer.component";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { PopupCloseButtonComponent } from "@/app/shared/components/ui-kit/popup/popup-close-button/popup-close-button.component";
import { SecondaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/secondary-button/secondary-button.component";
import { IdentityService } from "@/app/shared/services/api/identity.service";
import { NotificationService } from "@/app/shared/services/core/notification.service";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";
import { isErrorWithMessage } from "@/app/shared/helpers/errors/is-error-with-message";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { UserStore } from "@/app/shared/stores/user.store";
import {
    LOCAL_STORAGE_KEYS,
    LocalStorageService,
} from "@/app/shared/services/core/local-storage.service";

@Component({
    selector: "app-delete-account-popup",
    standalone: true,
    imports: [
        PopupLayoutComponent,
        PopupTitleComponent,
        PopupTextComponent,
        PopupFooterComponent,
        PrimaryButtonComponent,
        PopupCloseButtonComponent,
        SecondaryButtonComponent,
    ],
    templateUrl: "./delete-account-popup.component.html",
    styleUrl: "./delete-account-popup.component.scss",
})
export class DeleteAccountPopupComponent {
    private readonly router = inject(Router);
    private readonly dialogRef = inject(MatDialogRef);
    private readonly userStore = inject(UserStore);
    private readonly identityService = inject(IdentityService);
    private readonly notificationService = inject(NotificationService);
    private readonly authenticationService = inject(AuthenticationService);

    loading = false;

    public onCloseDialog(): void {
        if (this.loading) return;
        this.dialogRef.close();
    }

    onDeleteAccount() {
        this.loading = true;
        this.dialogRef.disableClose = true;
        this.identityService
            .delete({ deleteIdentity: true })
            .pipe(
                take(1),
                catchError(() => {
                    return throwError(
                        () => new Error("Failed to delete account. Please try again."),
                    );
                }),
                switchMap(() => this.userStore.profile$),
                take(1),
                tap((profile) => {
                    const accountsIds =
                        LocalStorageService.get<string[]>(
                            LOCAL_STORAGE_KEYS.personalInfoPopupShownForProfiles,
                        ) || [];
                    if (profile?.id && accountsIds.includes(profile.id)) {
                        const mewAccountsIds = accountsIds.filter(
                            (accountId) => accountId !== profile.id,
                        );
                        LocalStorageService.set(
                            LOCAL_STORAGE_KEYS.personalInfoPopupShownForProfiles,
                            mewAccountsIds,
                        );
                    }
                    this.userStore.refreshProfile();
                }),
                switchMap(() => this.authenticationService.logout()),
                catchError(() => {
                    return throwError(
                        () =>
                            new Error(
                                "Failed to log out after account deletion. Please log out manually.",
                            ),
                    );
                }),
            )
            .subscribe({
                next: () => {
                    this.notificationService.success("Account deleted successfully.");
                    this.dialogRef.close();
                    this.router.navigateByUrl("/" + AppRoutes.Auth.SIGN_IN);
                },
                error: (error: unknown) => {
                    let errorMessage = "An error occurred while deleting the account.";
                    if (isErrorWithMessage(error)) {
                        errorMessage = error.message;
                    }
                    this.notificationService.error(errorMessage);
                    this.loading = false;
                    this.dialogRef.disableClose = false;
                },
            });
    }
}
