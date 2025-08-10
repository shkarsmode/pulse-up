
import { Routes } from "@angular/router";
import { PrivatePageGuard } from "@/app/shared/helpers/guards/private-page.guard";
import { ProfileComponent } from "./profile.component";
import { RequiredPersonalInformationGuard } from "./guards/required-personal-information.guard";

export const PROFILE_ROUTES: Routes = [
    {
        path: "",
        component: ProfileComponent,
        children: [
            {
                path: "overview",
                loadComponent: () =>
                    import("./pages/overview-profile/overview-profile.component").then((m) => m.OverviewProfileComponent),
                canActivate: [PrivatePageGuard, RequiredPersonalInformationGuard],
            },
            {
                path: "edit",
                loadComponent: () =>
                    import("./pages/edit-profile/edit-profile.component").then((m) => m.EditProfileComponent),
                canActivate: [PrivatePageGuard],
            },
            {
                path: "change-email",
                loadComponent: () =>
                    import("./pages/change-email/change-email.component").then((m) => m.ChangeEmailComponent),
                canActivate: [PrivatePageGuard],
            },
            {
                path: "verify-email",
                loadComponent: () =>
                    import("./pages/verify-email/verify-email.component").then((m) => m.VerifyEmailComponent),
                canActivate: [PrivatePageGuard],
            },
            {
                path: "change-phone-number",
                loadComponent: () =>
                    import("./pages/change-phone-number/change-phone-number.component").then((m) => m.ChangePhoneNumberComponent),
                canActivate: [PrivatePageGuard],
            },
            {
                path: "confirm-phone-number",
                loadComponent: () =>
                    import("./pages/confirm-phone-number/confirm-phone-number.component").then((m) => m.ConfirmPhoneNumberComponent),
                canActivate: [PrivatePageGuard],
            },
            {
                path: "delete-account",
                loadComponent: () =>
                    import("./pages/delete-account/delete-account.component").then((m) => m.DeleteAccountComponent),
                canActivate: [PrivatePageGuard],
            },
        ],
    },
];
