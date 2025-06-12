import { inject, Injectable } from "@angular/core";
import {
    ActivatedRouteSnapshot,
    CanActivate,
    GuardResult,
    MaybeAsync,
    RouterStateSnapshot,
} from "@angular/router";
import { map, switchMap } from "rxjs";
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

        if (userToken || anonymousToken) {
            return this.loadInitialData().pipe(map(() => true));
        }

        return this.authenticationService.loginAsAnonymousThroughTheFirebase().pipe(
            switchMap(() => this.loadInitialData()),
            map(() => true),
        );
    }

    private loadInitialData = () => {
        if (this.appInitializerService.initialized) {
            return this.appInitializerService.initialData$;
        }
        this.loadingService.isLoading = true;
        return this.appInitializerService.loadInitialData()
    };
}
