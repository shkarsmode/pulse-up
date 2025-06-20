import { inject, Injectable } from "@angular/core";
import {
    ActivatedRouteSnapshot,
    CanActivate,
    GuardResult,
    MaybeAsync,
    Router,
    RouterStateSnapshot,
} from "@angular/router";
import { map } from "rxjs";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { ProfileStore } from "@/app/shared/stores/profile.store";

@Injectable({
    providedIn: "root",
})
export class RequiredPersonalInformationGuard implements CanActivate {
    private readonly router = inject(Router);
    private readonly profileStore = inject(ProfileStore);
    private readonly hasPublicInformation$ = this.profileStore.hasPublicInformation$;

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
