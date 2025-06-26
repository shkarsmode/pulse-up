import { inject, Injectable } from "@angular/core";
import { CanActivate } from "@angular/router";
import { catchError, map, Observable, of, switchMap } from "rxjs";
import { AuthenticationService } from "../../services/api/authentication.service";

@Injectable({
    providedIn: "root",
})
export class SignInPageGuard implements CanActivate {
    private readonly authenticationService: AuthenticationService = inject(AuthenticationService);
    canActivate(): Observable<boolean> {
        return this.authenticationService.user$.pipe(
            switchMap((user) => {
                if (user) {
                    return this.authenticationService.logout()
                }
                return of(user);
            }),
            catchError(() => {
                return of(false);
            }),
            map(() => true),
        )
    }
}
