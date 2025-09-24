import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AngularSvgIconModule } from "angular-svg-icon";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { AuthLayoutComponent } from "../../ui/auth-layout/auth-layout.component";
import { AuthFormComponent } from "../../ui/auth-form/auth-form.component";

@Component({
    selector: "app-sign-in-with-email-and-password",
    standalone: true,
    imports: [AuthLayoutComponent, AngularSvgIconModule, RouterModule, AuthFormComponent],
    templateUrl: "./sign-in-with-email-and-password.component.html",
    styleUrl: "./sign-in-with-email-and-password.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInWithEmailAndPasswordComponent {
    protected signUpLink = "/" + AppRoutes.Auth.SIGN_UP_WITH_EMAIL_AND_PASSWORD;
}
