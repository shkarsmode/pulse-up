import { inject, Injectable } from "@angular/core";
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot,
    UrlTree,
} from "@angular/router";
import { map, Observable } from "rxjs";
import { AuthenticationService } from "../../services/api/authentication.service";
import { SettingsService } from "../../services/api/settings.service";
import { AppRoutes } from "../../enums/app-routes.enum";
import { LoadingService } from "../../services/core/loading.service";

@Injectable({
    providedIn: "root",
})
export class PrivatePageGuard implements CanActivate {
    private readonly router: Router = inject(Router);
    private readonly loadingService: LoadingService = inject(LoadingService);
    private readonly settingsService: SettingsService = inject(SettingsService);
    private readonly authenticationService: AuthenticationService = inject(AuthenticationService);

    private readonly appRoutes = AppRoutes;

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const userToken = this.authenticationService.userTokenValue;
        this.loadingService.isLoading = true;
        
        if (userToken) {
            return this.getInitialData().pipe(map(() => true));
        }

        this.router.navigateByUrl(this.appRoutes.Auth.SIGN_IN);
        return false;
    }

    private getInitialData = () => {
        return this.settingsService.getSettings();
    };
}
