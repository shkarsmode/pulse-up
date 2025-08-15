import { ChangeDetectionStrategy, Component, DestroyRef, inject } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { MatMenuModule } from "@angular/material/menu";
import { AngularSvgIconModule } from "angular-svg-icon";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { SecondaryButtonComponent } from "../../ui-kit/buttons/secondary-button/secondary-button.component";
import { RouterLoadingIndicatorService } from "../../router-loading-indicator/router-loading-indicator.service";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";
import { switchMap, tap } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
    selector: "app-profile-button",
    standalone: true,
    imports: [SecondaryButtonComponent, AngularSvgIconModule, MatMenuModule, RouterLink],
    templateUrl: "./profile-button.component.html",
    styleUrl: "./profile-button.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileButtonComponent {
    private router = inject(Router);
    private destroyRef = inject(DestroyRef);
    private authenticationService = inject(AuthenticationService);
    private routerLoadingIndicatorService = inject(RouterLoadingIndicatorService);

    public profileRoute = '/' + AppRoutes.Profile.OVERVIEW;
    public loginRoute = '/' + AppRoutes.Auth.SIGN_IN;
    public get isAuthenticated(): boolean {
        return !!this.authenticationService.userTokenValue;
    }

    public logout(): void {
        this.routerLoadingIndicatorService.setLoading(true);
        this.authenticationService
            .logout()
            .pipe(
                switchMap(() => this.authenticationService.loginAsAnonymousThroughTheFirebase()),
                tap(() => {
                    this.router.navigateByUrl("/" + AppRoutes.Landing.HOME, {
                        replaceUrl: true,
                    });
                    this.routerLoadingIndicatorService.setLoading(false);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }
}
