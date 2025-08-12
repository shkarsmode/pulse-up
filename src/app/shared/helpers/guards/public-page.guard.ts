import { inject, Injectable } from "@angular/core";
import { CanActivate, GuardResult, MaybeAsync } from "@angular/router";
import { catchError, map, of } from "rxjs";
import { AuthenticationService } from "../../services/api/authentication.service";

@Injectable({
    providedIn: "root",
})
export class PublicPageGuard implements CanActivate {
    private readonly authenticationService: AuthenticationService = inject(AuthenticationService);

    canActivate(): MaybeAsync<GuardResult> {
        const userToken = this.authenticationService.userTokenValue;
        const anonymousToken = this.authenticationService.anonymousUserValue;

        if (userToken || anonymousToken) {
            return true;
        }

        return this.authenticationService.loginAsAnonymousThroughTheFirebase().pipe(
            catchError((error: unknown) => {
                console.log("PublicPageGuard error:", error);
                return of(false);
            }),
            map(() => true),
        );
    }
}
