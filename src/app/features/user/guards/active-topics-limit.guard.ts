import { inject, Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { map } from "rxjs";
import { UserStore } from "@/app/shared/stores/user.store";
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

@Injectable({
    providedIn: "root",
})
export class ActiveTopicsLimitGuard implements CanActivate {
    private router = inject(Router);
    private userStore = inject(UserStore);
    private dialog: MatDialog = inject(MatDialog);

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ): MaybeAsync<GuardResult> {
        return this.userStore.profile$.pipe(
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
