import { inject, Injectable } from "@angular/core";
import { CanActivate } from "@angular/router";
import { AuthenticationService } from "../../services/api/authentication.service";
import { catchError, map, Observable, of, tap } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class SignInPageGuard implements CanActivate {
    private readonly authenticationService: AuthenticationService = inject(AuthenticationService);
    canActivate(): Observable<boolean> {
        return this.authenticationService.logout().pipe(
            tap(() => {
                console.log("User logged out successfully.");
            }),
            catchError((error) => {
                console.error("Error during logout:", error);
                return of(false);
            }),
            map(() => true),
        );
    }
}
