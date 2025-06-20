import { inject, Injectable } from "@angular/core";
import {
    ActivatedRouteSnapshot,
    CanActivate,
    GuardResult,
    MaybeAsync,
    Router,
    RouterStateSnapshot,
} from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { map } from "rxjs";
import { CompleteProfilePopupComponent } from "@/app/shared/components/popups/complete-profile-popup/complete-profile-popup.component";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { ProfileStore } from "@/app/shared/stores/profile.store";

@Injectable({
    providedIn: "root",
})
export class RequiredPersonalInformationGuard implements CanActivate {
    private router = inject(Router);
    private profileStore = inject(ProfileStore);
    private dialog: MatDialog = inject(MatDialog);

    private hasPublicInformation$ = this.profileStore.hasPublicInformation$;

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ): MaybeAsync<GuardResult> {
        return this.hasPublicInformation$.pipe(
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

    private openPopup() {
        return this.dialog.open(CompleteProfilePopupComponent, {
            width: "630px",
            panelClass: "custom-dialog-container",
            backdropClass: "custom-dialog-backdrop",
        });
    }
}
