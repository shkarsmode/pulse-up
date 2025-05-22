import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
    {
        path: AppRoutes.Auth.SIGN_IN,
        loadComponent: () =>
            import("./pages/sign-in/sign-in.component").then((m) => m.SignInComponent),
    },
    {
        path: AppRoutes.Auth.CONFIRM_PHONE_NUMBER,
        loadComponent: () =>
            import("./pages/confirm-phone-number/confirm-phone-number.component").then((m) => m.ConfirmPhoneNumberComponent),
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AuthRoutingModule {}
