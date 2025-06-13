import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { PrivatePageGuard } from "@/app/shared/helpers/guards/private-page.guard";
import { ProfileComponent } from "./profile.component";

const routes: Routes = [
    {
        path: "",
        component: ProfileComponent,
        children: [
            {
                path: AppRoutes.Profile.REVIEW,
                loadComponent: () =>
                    import("./pages/review-profile/review-profile.component").then((m) => m.ReviewProfileComponent),
                canActivate: [PrivatePageGuard],
            },
            {
                path: AppRoutes.Profile.EDIT,
                loadComponent: () =>
                    import("./pages/edit-profile/edit-profile.component").then((m) => m.EditProfileComponent),
                canActivate: [PrivatePageGuard],
            },
            {
                path: AppRoutes.Profile.CHANGE_EMAIL,
                loadComponent: () =>
                    import("./pages/change-email/change-email.component").then((m) => m.ChangeEmailComponent),
                canActivate: [PrivatePageGuard],
            },
            {
                path: AppRoutes.Profile.VERIFY_EMAIL,
                loadComponent: () =>
                    import("./pages/verify-email/verify-email.component").then((m) => m.VerifyEmailComponent),
                canActivate: [PrivatePageGuard],
            },
            {
                path: AppRoutes.Profile.CHANGE_PHONE_NUMBER,
                loadComponent: () =>
                    import("./pages/change-phone-number/change-phone-number.component").then((m) => m.ChangePhoneNumberComponent),
                canActivate: [PrivatePageGuard],
            },
            {
                path: AppRoutes.Profile.CONFIRM_PHONE_NUMBER,
                loadComponent: () =>
                    import("./pages/confirm-phone-number/confirm-phone-number.component").then((m) => m.ConfirmPhoneNumberComponent),
                canActivate: [PrivatePageGuard],
            },
        ],
    },
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ProfileRoutingModule {}
