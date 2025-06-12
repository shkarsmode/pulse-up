import { inject, Injectable } from "@angular/core";
import { CanActivate } from "@angular/router";
import { catchError, map, Observable, of } from "rxjs";
import { AuthenticationService } from "../../services/api/authentication.service";

@Injectable({
    providedIn: "root",
})
export class SignInPageGuard implements CanActivate {
    private readonly authenticationService: AuthenticationService = inject(AuthenticationService);
    canActivate(): Observable<boolean> {
        return this.authenticationService.logout().pipe(
            catchError((error) => {
                console.error("Error during logout:", error);
                return of(false);
            }),
            map(() => true),
        );
    }
}
