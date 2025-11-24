import { AuthDisclaimerComponent } from "@/app/shared/components/auth-disclaimer/auth-disclaimer.component";
import { AuthFormComponent } from "@/app/shared/components/auth-form/auth-form.component";
import { RouterLoadingIndicatorService } from "@/app/shared/components/router-loading-indicator/router-loading-indicator.service";
import { LinkButtonComponent } from "@/app/shared/components/ui-kit/buttons/link-button/link-button.component";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";
import { NotificationService } from "@/app/shared/services/core/notification.service";
import { SignInFormService } from "@/app/shared/services/core/sign-in-form.service";
import { Component, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";
import { SvgIconComponent } from "angular-svg-icon";
import { catchError, of, tap } from "rxjs";
import { AuthLayoutComponent } from "../../ui/auth-layout/auth-layout.component";

@Component({
    selector: "app-sign-in",
    standalone: true,
    imports: [
        SvgIconComponent,
        AuthLayoutComponent,
        LinkButtonComponent,
        AuthFormComponent,
        AuthDisclaimerComponent,
    ],
    providers: [SignInFormService],
    templateUrl: "./sign-in-with-phone-number.component.html",
    styleUrl: "./sign-in-with-phone-number.component.scss",
})
export class SignInWithPhoneNumberComponent {
    private router = inject(Router);
    private destroyRef = inject(DestroyRef);
    private authenticationService = inject(AuthenticationService);
    private notificationService = inject(NotificationService);
    private loadingService = inject(RouterLoadingIndicatorService);

    public onClickGuest() {
        this.loadingService.setLoading(true);
        this.authenticationService
            .loginAsAnonymousThroughTheFirebase()
            .pipe(
                catchError(() => {
                    this.notificationService.error("Failed to sign in as guest");
                    return of(null);
                }),
                tap(() => {
                    this.router.navigate([AppRoutes.Landing.MAP]);
                    this.loadingService.setLoading(false);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    public navigateToConfirmPage() {
        const redirectUrl = this.getRedirectUrl();
        const params = new URLSearchParams({
            ...(redirectUrl && { redirect: redirectUrl }),
            mode: "signIn",
        }).toString();
        
        this.router.navigateByUrl(`${AppRoutes.Auth.CONFIRM_PHONE_NUMBER}?${params}`);
    }

    private getRedirectUrl(): string | null {
        const tree = this.router.parseUrl(this.router.url);
        return tree.queryParams["redirect"] || null;
    }
}
