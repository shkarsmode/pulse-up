import { inject, Injectable } from "@angular/core";
import { CanActivate } from "@angular/router";
import { AuthenticationService } from "../../services/api/authentication.service";

@Injectable({
    providedIn: "root",
})
export class SignInPageGuard implements CanActivate {
    private readonly authenticationService = inject(AuthenticationService);
    canActivate() {
        const isAuthenticated = !!this.authenticationService.userTokenValue || !this.authenticationService.anonymousUserValue;
        if (!isAuthenticated) {
            return true;
        }
        return false;
    }
}
