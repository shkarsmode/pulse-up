import { inject, Injectable } from "@angular/core";
import { CanActivate, GuardResult, MaybeAsync } from "@angular/router";
import { catchError, filter, map, of, switchMap } from "rxjs";
import { AuthenticationService } from "../../services/api/authentication.service";
import { AppInitializerService } from "../../services/core/app-initializer.service";

@Injectable({
    providedIn: "root",
})
export class PublicPageGuard implements CanActivate {
    private readonly appInitializerService: AppInitializerService = inject(AppInitializerService);
    private readonly authenticationService: AuthenticationService = inject(AuthenticationService);

    canActivate(): MaybeAsync<GuardResult> {
        const userToken = this.authenticationService.userTokenValue;
        const anonymousToken = this.authenticationService.anonymousUserValue;

        if (userToken || anonymousToken) {
            this.appInitializerService.loadInitialData();
            return this.appInitializerService.initialized$.pipe(
                filter((initialized) => initialized),
                map(() => true),
            );
        }

        return this.authenticationService.loginAsAnonymousThroughTheFirebase().pipe(
            catchError((error: unknown) => {
                console.log("PublicPageGuard error:", error);
                return of(false);
            }),
            switchMap(() => {
                this.appInitializerService.loadInitialData();
                return this.appInitializerService.initialized$;
            }),
            filter((initialized) => initialized),
            map(() => true),
        );
    }
}
