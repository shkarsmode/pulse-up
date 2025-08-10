import { Routes } from "@angular/router";
import { CommunityComponent } from "./community.component";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { PublicPageGuard } from "@/app/shared/helpers/guards/public-page.guard";

export const COMMUNITY_ROUTES: Routes = [
    {
        path: "",
        component: CommunityComponent,
        children: [
            {
                path: AppRoutes.Community.PRIVACY,
                loadComponent: () =>
                    import("./privacy/privacy.component").then((m) => m.PrivacyComponent),
                canActivate: [PublicPageGuard],
            },
            {
                path: AppRoutes.Community.TERMS,
                loadComponent: () =>
                    import("./terms/terms.component").then((m) => m.TermsComponent),
                canActivate: [PublicPageGuard],
            },
            {
                path: AppRoutes.Community.SUPPORT,
                loadComponent: () =>
                    import("./support/support.component").then((m) => m.SupportComponent),
                canActivate: [PublicPageGuard],
            },
            {
                path: AppRoutes.Community.INVALID_LINK,
                loadComponent: () =>
                    import("./invalid-link/invalid-link.component").then((m) => m.InvalidLinkComponent),
                canActivate: [PublicPageGuard],
            },
            {
                path: AppRoutes.Community.CHILD_SAFETY,
                loadComponent: () =>
                    import("./child-safety/child-safety.component").then((m) => m.ChildSafetyComponent),
                canActivate: [PublicPageGuard],
            },
            {
                path: AppRoutes.Community.NOT_FOUND,
                loadComponent: () =>
                    import("./not-found/not-found.component").then((m) => m.NotFoundComponent),
                canActivate: [PublicPageGuard],
            },
            {
                path: "**",
                pathMatch: "full",
                loadComponent: () =>
                    import("./not-found/not-found.component").then((m) => m.NotFoundComponent),
                canActivate: [PublicPageGuard],
            },
        ],
    },
];
