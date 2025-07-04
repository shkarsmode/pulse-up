import { inject, Injectable } from "@angular/core";
import {
    ActivatedRouteSnapshot,
    CanActivate,
    GuardResult,
    MaybeAsync,
    Router,
    RouterStateSnapshot,
} from "@angular/router";
import { map, tap } from "rxjs";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { ProfileService } from "@/app/shared/services/profile/profile.service";

@Injectable({
    providedIn: "root",
})
export class RequiredPersonalInformationGuard implements CanActivate {
    private readonly router = inject(Router);
    private readonly profileService = inject(ProfileService);

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ): MaybeAsync<GuardResult> {
        return this.profileService.hasPublicInformation$.pipe(
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
