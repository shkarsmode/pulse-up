import { inject, Injectable } from "@angular/core";
import {
    ActivatedRouteSnapshot,
    CanActivate,
    GuardResult,
    MaybeAsync,
    RouterStateSnapshot,
} from "@angular/router";
import { catchError, filter, map, of, switchMap } from "rxjs";
import { AuthenticationService } from "../../services/api/authentication.service";
import { LoadingService } from "../../services/core/loading.service";
import { AppInitializerService } from "../../services/core/app-initializer.service";

@Injectable({
    providedIn: "root",
})
export class PublicPageGuard implements CanActivate {
    private readonly loadingService: LoadingService = inject(LoadingService);
    private readonly appInitializerService: AppInitializerService = inject(AppInitializerService);
    private readonly authenticationService: AuthenticationService = inject(AuthenticationService);

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ): MaybeAsync<GuardResult> {
        const userToken = this.authenticationService.userTokenValue;
        const anonymousToken = this.authenticationService.anonymousUserValue;
        this.loadingService.isLoading = true;

        if (userToken || anonymousToken) {
            this.appInitializerService.loadInitialData({ isAuthenticatedUser: !!userToken });
            return this.appInitializerService.initialized$.pipe(
                filter((initialized) => initialized),
                map(() => true),
            );
        }

        return this.authenticationService.loginAsAnonymousThroughTheFirebase().pipe(
            catchError((error) => {
                console.log("PublicPageGuard error:", error);
                return of(false);
            }),
            switchMap(() => {
            this.appInitializerService.loadInitialData({ isAuthenticatedUser: false });
                return this.appInitializerService.initialized$;
            }),
            filter((initialized) => initialized),
            map(() => true),
        );
    }
}
