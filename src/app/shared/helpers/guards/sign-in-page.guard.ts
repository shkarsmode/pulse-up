import { inject, Injectable } from "@angular/core";
import { CanActivate } from "@angular/router";
import { catchError, map, Observable, of, switchMap } from "rxjs";
import { AuthenticationService } from "../../services/api/authentication.service";
import { LoadingService } from "../../services/core/loading.service";

@Injectable({
    providedIn: "root",
})
export class SignInPageGuard implements CanActivate {
    private readonly loadingService = inject(LoadingService);
    private readonly authenticationService = inject(AuthenticationService);
    canActivate(): Observable<boolean> {
        this.loadingService.isLoading = true;
        return this.authenticationService.logout().pipe(
            catchError((error) => {
                return of(false);
            }),
            map(() => true),
        )
    }
}
