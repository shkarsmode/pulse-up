import { inject, Injectable } from "@angular/core";
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot,
    UrlTree,
} from "@angular/router";
import { JwtPayload, jwtDecode } from "jwt-decode";
import { map, Observable } from "rxjs";
import { AuthenticationService } from "../../services/api/authentication.service";
import { SettingsService } from "../../services/api/settings.service";
import { AppRoutes } from "../../enums/app-routes.enum";

@Injectable({
    providedIn: "root",
})
export class PrivatePageGuard implements CanActivate {
    private readonly router: Router = inject(Router);
    private readonly settingsService: SettingsService = inject(SettingsService);
    private readonly authenticationService: AuthenticationService = inject(AuthenticationService);

    private readonly appRoutes = AppRoutes;

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const userToken = this.authenticationService.userTokenValue;

        if (userToken && !this._isTokenExpired(userToken)) {
            return this.getInitialData().pipe(map(() => true));
        }

        this.router.navigateByUrl(this.appRoutes.Auth.SIGN_IN);
        return false;
    }

    private _decodeToken(token: string): JwtPayload | null {
        try {
            return jwtDecode<JwtPayload>(token);
        } catch (error) {
            console.error("Invalid token or unable to decode:", error);
            return null;
        }
    }

    private _isTokenExpired(token: string | null): boolean {
        if (!token) {
            return true;
        }

        const decodedToken = this._decodeToken(token);
        if (!decodedToken || !decodedToken.exp) {
            return true;
        }

        const currentTime = Math.floor(Date.now() / 1000);
        return decodedToken.exp < currentTime;
    }

    private getInitialData = () => {
        return this.settingsService.getSettings();
    };
}
