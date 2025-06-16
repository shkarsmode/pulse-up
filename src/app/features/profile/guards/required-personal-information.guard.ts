import { inject, Injectable } from "@angular/core";
import {
    ActivatedRouteSnapshot,
    CanActivate,
    GuardResult,
    MaybeAsync,
    Router,
    RouterStateSnapshot,
} from "@angular/router";
import { UserStore } from "@/app/shared/stores/user.store";
import { map } from "rxjs";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";

@Injectable({
    providedIn: "root",
})
export class RequiredPersonalInformationGuard implements CanActivate {
    private readonly router = inject(Router);
    private readonly userStore = inject(UserStore);
    private readonly hasPublicInformation$ = this.userStore.hasPublicInformation$;

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ): MaybeAsync<GuardResult> {
        return this.hasPublicInformation$.pipe(
            map((hasPublicInformation) => {
                if (!hasPublicInformation) {
                    this.router.navigateByUrl("/" + AppRoutes.Profile.EDIT);
                    return false;
                }
                return true;
            }),
        );
    }
}
