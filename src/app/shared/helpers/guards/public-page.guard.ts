import { inject, Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from "@angular/router";
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
        const userToken = this.authenticationService.userTokenValue;
        const anonymousToken = this.authenticationService.anonymousUserValue;

        if (userToken) {
            console.log("User is authenticated and token is valid.");
            return this.getInitialData().pipe(map(() => true));
        }

        if (anonymousToken) {
            console.log("User is anonymous and token is valid.");
            return this.getInitialData().pipe(map(() => true));
        }

        console.log("User is not authenticated or token is expired. Logging in as anonymous.");
        return this.authenticationService.loginAsAnonymousThroughTheFirebase().pipe(
            switchMap(() => this.getInitialData()),
            map(() => true),
        );
    }

    private getInitialData = () => {
        return this.settingsService.getSettings();
    };
}
