import { inject, Injectable } from "@angular/core";
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot,
    UrlTree,
} from "@angular/router";
import { Observable } from "rxjs";
import { AppRoutes } from "../../enums/app-routes.enum";
import { AuthenticationService } from "../../services/api/authentication.service";

@Injectable({
    providedIn: "root",
})
export class PrivatePageGuard implements CanActivate {
    private readonly router: Router = inject(Router);
    private readonly authenticationService: AuthenticationService = inject(AuthenticationService);

    private readonly appRoutes = AppRoutes;

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const userToken = this.authenticationService.userTokenValue;

        if (userToken) {
            return true;
        }

        this.router.navigateByUrl(`/${this.appRoutes.Auth.SIGN_IN_WITH_PHONE}?redirect=${state.url}`);
        return false;
    }
}
