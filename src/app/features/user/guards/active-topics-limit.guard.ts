import { inject, Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { map } from "rxjs";
import {
    ActivatedRouteSnapshot,
    CanActivate,
    GuardResult,
    MaybeAsync,
    Router,
    RouterStateSnapshot,
} from "@angular/router";
import { ActiveTopicsLimitPopupComponent } from "../ui/active-topics-limit-popup/active-topics-limit-popup.component";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { ProfileService } from "@/app/shared/services/profile/profile.service";

@Injectable({
    providedIn: "root",
})
export class ActiveTopicsLimitGuard implements CanActivate {
    private router = inject(Router);
    private profileService = inject(ProfileService);
    private dialog: MatDialog = inject(MatDialog);

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ): MaybeAsync<GuardResult> {
        return this.profileService.profile$.pipe(
            map((profile) => {
                if (profile && profile.activeTopics >= profile.activeTopicsLimit) {
                    this.router.navigateByUrl("/" + AppRoutes.Landing.TOPICS);
                    this.dialog.open(ActiveTopicsLimitPopupComponent, {
                        width: "630px",
                        panelClass: "custom-dialog-container",
                        backdropClass: "custom-dialog-backdrop",
                    });
                    return false;
                }
                return true;
            }),
        );
    }
}
