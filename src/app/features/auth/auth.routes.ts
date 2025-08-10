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
                path: AppRoutes.Auth.SIGN_IN,
                loadComponent: () =>
                    import("./pages/sign-in/sign-in.component").then((m) => m.SignInComponent),
                canActivate: [SignInPageGuard],
            },
            {
                path: AppRoutes.Auth.CONFIRM_PHONE_NUMBER,
                loadComponent: () =>
                    import("./pages/confirm-phone-number/confirm-phone-number.component").then(
                        (m) => m.ConfirmPhoneNumberComponent,
                    ),
            },
        ],
    },
];
