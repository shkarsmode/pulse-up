import { Routes } from "@angular/router";

export const APP_ROUTES: Routes = [
    {
        path: "",
        loadChildren: () => import("./features/landing/landing.routes").then((m) => m.LANDING_ROUTES),
    },
    {
        path: "",
        loadChildren: () => import("./features/auth/auth.routes").then((m) => m.AUTH_ROUTES),
    },
    {
        path: "user",
        loadChildren: () => import("./features/user/user.routes").then((m) => m.USER_ROUTES),
    },
    {
        path: "profile",
        loadChildren: () => import("./features/profile/profile.routes").then((m) => m.PROFILE_ROUTES),
    },
    {
        path: "",
        loadChildren: () => import("./features/community/community.routes").then((m) => m.COMMUNITY_ROUTES),
    },
];
