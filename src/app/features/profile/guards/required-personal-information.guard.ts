import { inject, Injectable } from "@angular/core";
import { CanActivate, GuardResult, MaybeAsync, Router } from "@angular/router";
import { first, map } from "rxjs";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { ProfileService } from "@/app/shared/services/profile/profile.service";

@Injectable({
    providedIn: "root",
})
export class RequiredPersonalInformationGuard implements CanActivate {
    private readonly router = inject(Router);
    private readonly profileService = inject(ProfileService);

    canActivate(): MaybeAsync<GuardResult> {
        const hasPublicInformation$ = this.profileService.profile$.pipe(
            first((profile) => profile !== null),
            map((profile) => !!(profile?.name && profile?.username)),
        );
        return hasPublicInformation$.pipe(
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
