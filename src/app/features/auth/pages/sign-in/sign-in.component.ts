import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { SvgIconComponent } from "angular-svg-icon";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { SignInFormService } from "@/app/shared/services/core/sign-in-form.service";
import { LinkButtonComponent } from "@/app/shared/components/ui-kit/buttons/link-button/link-button.component";
import { AuthFormComponent } from "@/app/shared/components/auth-form/auth-form.component";
import { AuthDisclaimerComponent } from "@/app/shared/components/auth-disclaimer/auth-disclaimer.component";
import { AuthLayoutComponent } from "../../ui/auth-layout/auth-layout.component";
import { AnonymousSigninService } from "../../services/anonymous-signin.service";

@Component({
    selector: "app-sign-in",
    standalone: true,
    imports: [SvgIconComponent, AuthLayoutComponent, LinkButtonComponent, AuthFormComponent, AuthDisclaimerComponent],
    providers: [SignInFormService, AnonymousSigninService],
    templateUrl: "./sign-in.component.html",
    styleUrl: "./sign-in.component.scss",
})
export class SignInComponent {
    private router = inject(Router);
    private anonymousSigninService = inject(AnonymousSigninService);

    public onClickGuest() {
        this.anonymousSigninService.loginAsAnonymous();
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
