import { Routes } from "@angular/router";

export const APP_ROUTES: Routes = [
    {
        path: "",
        loadChildren: () => import("./features/landing/landing.routes").then((m) => m.LANDING_ROUTES),
    },
    {
        path: "auth",
        loadChildren: () => import("./features/auth/auth.routes").then((m) => m.AUTH_ROUTES),
    },
];
