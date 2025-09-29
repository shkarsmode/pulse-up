import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {
    LOCAL_STORAGE_KEYS,
    LocalStorageService,
} from "@/app/shared/services/core/local-storage.service";
import { ProfileLayoutComponent } from "../../ui/profile-layout/profile-layout.component";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";
import { MatDialog } from "@angular/material/dialog";
import { ChangeEmailPopupComponent } from "@/app/shared/components/popups/change-email-popup/change-email-popup.component";

@Component({
    selector: "app-verify-email",
    standalone: true,
    imports: [ProfileLayoutComponent],
    templateUrl: "./verify-email.component.html",
    styleUrl: "./verify-email.component.scss",
})
export class VerifyEmailComponent implements OnInit {
    private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
    private readonly dialog: MatDialog = inject(MatDialog);
    private readonly authenticationService: AuthenticationService = inject(AuthenticationService);

    public email: string | null = null;

    ngOnInit() {
        const mode = this.activatedRoute.snapshot.queryParamMap.get("action");

        if (mode === "verifyEmail") {
            this.email = LocalStorageService.get<string>(LOCAL_STORAGE_KEYS.verifyEmail);
            if (!this.email) {
                this.authenticationService.logout({
                    redirectUrl: "/" + AppRoutes.Auth.SIGN_IN_WITH_PHONE,
                });
                return;
            }

            const showPopup = this.activatedRoute.snapshot.queryParamMap.get("showPopup");
            if (showPopup === "true") {
                this.dialog.open(ChangeEmailPopupComponent, {
                    width: "630px",
                    panelClass: "custom-dialog-container",
                    backdropClass: "custom-dialog-backdrop",
                    disableClose: true,
                    data: {
                        mode: "verifyEmail",
                    },
                });
            }
        } else if (mode === "changeEmail") {
            this.email = LocalStorageService.get<string>(LOCAL_STORAGE_KEYS.changeEmail);
            if (!this.email) {
                this.authenticationService.logout({
                    redirectUrl: "/" + AppRoutes.Auth.SIGN_IN_WITH_PHONE,
                });
                return;
            }

            const showPopup = this.activatedRoute.snapshot.queryParamMap.get("showPopup");
            if (showPopup === "true") {
                this.dialog.open(ChangeEmailPopupComponent, {
                    width: "630px",
                    panelClass: "custom-dialog-container",
                    backdropClass: "custom-dialog-backdrop",
                    disableClose: true,
                    data: {
                        mode: "changeEmail",
                    },
                });
            }
        }
    }
}
