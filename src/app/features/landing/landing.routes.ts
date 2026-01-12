import { HeaderCleanupGuard } from "@/app/shared/components/header/header-cleanup.guard";
import { HeaderGuard } from "@/app/shared/components/header/header.guard";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { PublicPageGuard } from "@/app/shared/helpers/guards/public-page.guard";
import { metaTagsData } from "@/assets/data/meta-tags";
import { Routes } from "@angular/router";
import { LandingComponent } from "./landing.component";

const Landing = AppRoutes.Landing;

export const LANDING_ROUTES: Routes = [
    {
        path: "",
        component: LandingComponent,
        children: [
            {
                path: Landing.HOME,
                loadComponent: () =>
                    import("./pages/main/main.component").then((m) => m.MainComponent),
                canActivate: [HeaderGuard, PublicPageGuard],
                canDeactivate: [HeaderCleanupGuard],
                data: metaTagsData.home,
            },
            {
                path: Landing.MAP,
                loadComponent: () =>
                    import("./pages/map-page/map-page.component").then((m) => m.MapPageComponent),
                canActivate: [PublicPageGuard],
                data: metaTagsData.map,
            },
            {
                path: Landing.TOPICS,
                loadComponent: () =>
                    import("./pages/topics/topics.component").then((m) => m.TopicsComponent),
                canActivate: [PublicPageGuard],
                data: metaTagsData.topics,
            },
            {
                path: Landing.TOPIC,
                loadComponent: () =>
                    import("./pages/topic/topic.component").then(
                        (m) => m.TopicComponent,
                    ),
                canActivate: [PublicPageGuard],
            },
            {
                path: Landing.HEATMAP,
                loadComponent: () =>
                    import("./pages/pulse-heatmap-page/pulse-heatmap-page.component").then(
                        (m) => m.PulseHeatmapPageComponent,
                    ),
                canActivate: [PublicPageGuard],
            },
            {
                path: Landing.ABOUT,
                loadComponent: () =>
                    import("./pages/about/about.component").then((m) => m.AboutComponent),
                canActivate: [PublicPageGuard],
                data: metaTagsData.about,
            },
            {
                path: Landing.USER,
                loadComponent: () =>
                    import("./pages/user/user.component").then((m) => m.UserComponent),
                canActivate: [PublicPageGuard],
            },
            {
                path: Landing.LEADERBOARD,
                loadComponent: () =>
                    import("./pages/leaderboard-page/leaderboard-page.component").then(
                        (m) => m.LeaderboardPageComponent,
                    ),
                canActivate: [PublicPageGuard],
                data: metaTagsData.leaderboard,
            },
            {
                path: Landing.BLOG,
                loadComponent: () =>
                    import("./pages/blog-page/blog-page.component").then(
                        (m) => m.BlogPageComponent,
                    ),
                canActivate: [PublicPageGuard],
                data: metaTagsData.blog,
            },
            {
                path: Landing.POST,
                loadComponent: () =>
                    import("./pages/blog-page/components/post/post.component").then(
                        (m) => m.PostComponent,
                    ),
                canActivate: [PublicPageGuard],
            },
        ],
    },
];
