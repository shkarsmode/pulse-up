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
import { UserStore } from "@/app/shared/stores/user.store";
import { CompleteProfilePopupComponent } from "@/app/shared/components/popups/complete-profile-popup/complete-profile-popup.component";


@Injectable({
    providedIn: "root",
})
export class RequiredPersonalInformationGuard implements CanActivate {
    private router = inject(Router);
    private userStore = inject(UserStore);
    private dialog: MatDialog = inject(MatDialog);

    private isProfileComplete$ = this.userStore.profile$.pipe(
        map((profile) => (profile ? !!(profile.name && profile.username) : false)),
    );

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ): MaybeAsync<GuardResult> {
        return this.isProfileComplete$.pipe(
            map((isProfileComplete) => {
                if (!isProfileComplete) {
                    this.openPopup();
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
