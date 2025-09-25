import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { SignInPageGuard } from "@/app/shared/helpers/guards/sign-in-page.guard";
import { Routes } from "@angular/router";
import { AuthComponent } from "./auth.component";

export const AUTH_ROUTES: Routes = [
    {
        path: "",
        component: AuthComponent,
        children: [
            {
                path: AppRoutes.Auth.SIGN_IN_WITH_PHONE,
                loadComponent: () =>
                    import(
                        "./pages/sign-in-with-phone-number/sign-in-with-phone-number.component"
                    ).then((m) => m.SignInWithPhoneNumberComponent),
                canActivate: [SignInPageGuard],
            },
            {
                path: AppRoutes.Auth.CONFIRM_PHONE_NUMBER,
                loadComponent: () =>
                    import("./pages/confirm-phone-number/confirm-phone-number.component").then(
                        (m) => m.ConfirmPhoneNumberComponent,
                    ),
                canActivate: [SignInPageGuard],
            },
            {
                path: AppRoutes.Auth.SIGN_IN_WITH_EMAIL_AND_PASSWORD,
                loadComponent: () =>
                    import(
                        "./pages/sign-in-with-email-and-password/sign-in-with-email-and-password.component"
                    ).then((m) => m.SignInWithEmailAndPasswordComponent),
                canActivate: [SignInPageGuard],
            },
            {
                path: AppRoutes.Auth.SIGN_UP_WITH_EMAIL_AND_PASSWORD,
                loadComponent: () =>
                    import(
                        "./pages/sign-up-with-email-and-password/sign-up-with-email-and-password.component"
                    ).then((m) => m.SignUpWithEmailAndPasswordComponent),
                canActivate: [SignInPageGuard],
            },
        ],
    },
];
