import { inject, Injectable } from "@angular/core";
import { catchError, of, switchMap, take, tap } from "rxjs";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";
import { NotificationService } from "@/app/shared/services/core/notification.service";
import { AppInitializerService } from "@/app/shared/services/core/app-initializer.service";
import { LoadingService } from "@/app/shared/services/core/loading.service";
import { Router } from "@angular/router";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";

@Injectable()
export class AnonymousSigninService {
    private router = inject(Router);
    private authenticationService = inject(AuthenticationService);
    private notificationService = inject(NotificationService);
    private appInitializerService = inject(AppInitializerService);
    private loadingService = inject(LoadingService);

    public loginAsAnonymous(): void {
        this.authenticationService.loginAsAnonymousThroughTheFirebase().pipe(
            take(1),
            catchError((error) => {
                this.notificationService.error("Failed to sign in as guest");
                return of(null);
            }),
            switchMap(() => this.loadInitialData()),
            tap(() => this.router.navigate([AppRoutes.Landing.HOME]))
        ).subscribe();
    }

    private loadInitialData = () => {
        if (this.appInitializerService.initialized) {
            return this.appInitializerService.initialData$;
        }
        this.loadingService.isLoading = true;
        return this.appInitializerService.loadInitialData();
    };
}
