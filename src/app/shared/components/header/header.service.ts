import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { AuthenticationService } from "../../services/api/authentication.service";
import { LoadingService } from "../../services/core/loading.service";
import { switchMap, take, tap } from "rxjs";
import { AppRoutes } from "../../enums/app-routes.enum";

@Injectable()
export class HeaderService {
    private readonly router = inject(Router);
    private readonly loadingService = inject(LoadingService);
    private readonly authenticationService = inject(AuthenticationService);

    signOut(): void {
        this.loadingService.isLoading = true;
        this.authenticationService
            .logout()
            .pipe(
                take(1),
                switchMap(() => this.authenticationService.loginAsAnonymousThroughTheFirebase()),
                tap(() => {
                  this.router.navigateByUrl("/" + AppRoutes.Landing.HOME, {
                    replaceUrl: true,
                  });
                  this.loadingService.isLoading = false;
                }),
            )
            .subscribe();
    }
}
