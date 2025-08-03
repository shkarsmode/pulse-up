import { inject, Injectable } from "@angular/core";
import { catchError, of, tap } from "rxjs";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";
import { NotificationService } from "@/app/shared/services/core/notification.service";
import { LoadingService } from "@/app/shared/services/core/loading.service";
import { Router } from "@angular/router";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";

@Injectable()
export class AnonymousSigninService {
    private router = inject(Router);
    private authenticationService = inject(AuthenticationService);
    private notificationService = inject(NotificationService);
    private loadingService = inject(LoadingService);

    public loginAsAnonymous(): void {
        this.loadingService.isLoading = true;
        this.authenticationService.loginAsAnonymousThroughTheFirebase().pipe(
            catchError(() => {
                this.notificationService.error("Failed to sign in as guest");
                return of(null);
            }),
            tap(() => this.router.navigate([AppRoutes.Landing.HOME]))
        ).subscribe();
    }
}
