import { inject, Injectable } from "@angular/core";
import { CanActivate, GuardResult, MaybeAsync, Router } from "@angular/router";
import { first, map } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { ProfileService } from "@/app/shared/services/profile/profile.service";

@Injectable({
    providedIn: "root",
})
export class RequiredPersonalInformationGuard implements CanActivate {
    private router = inject(Router);
    private profileService = inject(ProfileService);
    private dialog: MatDialog = inject(MatDialog);

    canActivate(): MaybeAsync<GuardResult> {
        const hasPublicInformation$ = this.profileService.profile$.pipe(
            first((profile) => profile !== null),
            map((profile) => !!(profile?.name && profile?.username)),
        );

        return hasPublicInformation$.pipe(
            map((hasPublicInformation) => {
                if (!hasPublicInformation) {
                    this.openPopup();
                    this.router.navigateByUrl("/" + AppRoutes.Landing.TOPICS);
                    return false;
                }
                return true;
            }),
        );
    }

    private async openPopup() {
        const CompleteProfilePopupComponent = await import(
            "@/app/shared/components/popups/complete-profile-popup/complete-profile-popup.component"
        ).then((module) => module.CompleteProfilePopupComponent);
        return this.dialog.open(CompleteProfilePopupComponent, {
            width: "630px",
            panelClass: "custom-dialog-container",
            backdropClass: "custom-dialog-backdrop",
        });
    }
}
