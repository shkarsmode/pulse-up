import { inject, Injectable } from "@angular/core";
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot,
    UrlTree,
} from "@angular/router";
import { filter, map, Observable } from "rxjs";
import { AppRoutes } from "../../enums/app-routes.enum";
import { AuthenticationService } from "../../services/api/authentication.service";
import { LoadingService } from "../../services/core/loading.service";
import { AppInitializerService } from "../../services/core/app-initializer.service";

@Injectable({
    providedIn: "root",
})
export class PrivatePageGuard implements CanActivate {
    private readonly router: Router = inject(Router);
    private readonly loadingService: LoadingService = inject(LoadingService);
    private readonly appInitializerService: AppInitializerService = inject(AppInitializerService);
    private readonly authenticationService: AuthenticationService = inject(AuthenticationService);

    private readonly appRoutes = AppRoutes;

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const userToken = this.authenticationService.userTokenValue;

        if (userToken) {
            this.loadingService.isLoading = true;
            this.appInitializerService.loadInitialData();
            return this.appInitializerService.initialized$.pipe(
                filter((initialized) => initialized),
                map(() => true)
            );
        }

        this.router.navigateByUrl(`${this.appRoutes.Auth.SIGN_IN}?redirect=${state.url}`);
        return false;
    }
}
