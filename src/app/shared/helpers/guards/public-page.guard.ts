import { inject, Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from "@angular/router";
import { JwtPayload, jwtDecode } from "jwt-decode";
import { map, Observable, switchMap } from "rxjs";
import { AuthenticationService } from "../../services/api/authentication.service";
import { SettingsService } from "../../services/api/settings.service";

@Injectable({
    providedIn: "root",
})
export class PublicPageGuard implements CanActivate {
    private readonly settingsService: SettingsService = inject(SettingsService);
    private readonly authenticationService: AuthenticationService = inject(AuthenticationService);

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        console.log("AuthPublicPageGuard");

        const userToken = this.authenticationService.userTokenValue;
        const anonymousToken = this.authenticationService.anonymousUserValue;

        if (userToken && !this._isTokenExpired(userToken)) {
            console.log("User is authenticated and token is valid.");
            return this.getInitialData().pipe(map(() => true));
        }

        if (anonymousToken && !this._isTokenExpired(anonymousToken)) {
            console.log("User is anonymous and token is valid.");
            return this.getInitialData().pipe(map(() => true));
        }

        console.log("User is not authenticated or token is expired. Logging in as anonymous.");
        return this.authenticationService.loginAsAnonymousThroughTheFirebase().pipe(
            switchMap(() => this.getInitialData()),
            map(() => true),
        );
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
