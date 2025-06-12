import { inject, Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from "@angular/router";
import { map, Observable, switchMap, tap } from "rxjs";
import { AuthenticationService } from "../../services/api/authentication.service";
import { SettingsService } from "../../services/api/settings.service";
import { LoadingService } from "../../services/core/loading.service";

@Injectable({
    providedIn: "root",
})
export class PublicPageGuard implements CanActivate {
    private readonly loadingService: LoadingService = inject(LoadingService);
    private readonly settingsService: SettingsService = inject(SettingsService);
    private readonly authenticationService: AuthenticationService = inject(AuthenticationService);

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        const userToken = this.authenticationService.userTokenValue;
        const anonymousToken = this.authenticationService.anonymousUserValue;
        this.loadingService.isLoading = true;

        if (userToken || anonymousToken) {
            return this.getInitialData().pipe(map(() => true));
        }

        return this.authenticationService.loginAsAnonymousThroughTheFirebase().pipe(
            switchMap(() => this.getInitialData()),
            map(() => true),
        );
    }

    private getInitialData = () => {
        return this.settingsService.getSettings();
    };
}
