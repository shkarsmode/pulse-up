import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './landing.component';
import { AppRoutes } from '@/app/shared/enums/app-routes.enum';
import { FooterGuard } from '@/app/shared/components/footer/footer.guard';
import { FooterCleanupGuard } from '@/app/shared/components/footer/footerCleanup.guard';
import { HeaderGuard } from '@/app/shared/components/header/header.guard';
import { HeaderCleanupGuard } from '@/app/shared/components/header/header-cleanup.guard';
import { metaTagsData } from '@/assets/data/meta-tags';
import { PublicPageGuard } from '@/app/shared/helpers/guards/public-page.guard';
import { CollectPersonalInfoGuard } from '@/app/shared/helpers/guards/collect-personal-info.guard';

let Landing = AppRoutes.Landing;

const routes: Routes = [
    {
        path: '',
        component: LandingComponent,
        
        children: [
            {
                path: Landing.HOME,
                loadComponent: () => import('./pages/main/main.component').then((m) => m.MainComponent),
                canActivate: [HeaderGuard, PublicPageGuard, CollectPersonalInfoGuard],
                canDeactivate: [HeaderCleanupGuard],
                data: metaTagsData.home,
            },
            {
                path: Landing.MAP,
                loadComponent: () => import('./pages/map-page/map-page.component').then((m) => m.MapPageComponent),
                canActivate: [FooterGuard, PublicPageGuard],
                canDeactivate: [FooterCleanupGuard],
            },
            {
                path: Landing.TOPICS,
                loadComponent: () => import('./pages/pulses/pulses.component').then((m) => m.PulsesComponent),
                canActivate: [PublicPageGuard],
                data: metaTagsData.topics,
            },
            {
                path: Landing.TOPIC,
                loadComponent: () => import('./pages/pulse-page/pulse-page.component').then((m) => m.PulsePageComponent),
                canActivate: [PublicPageGuard],
            },
            {
                path: Landing.HEATMAP,
                loadComponent: () => import('./pages/pulse-heatmap-page/pulse-heatmap-page.component').then((m) => m.PulseHeatmapPageComponent),
                canActivate: [PublicPageGuard],
            },
            {
                path: Landing.ABOUT,
                loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent),
                canActivate: [PublicPageGuard],
            },
            {
                path: Landing.USER,
                loadComponent: () => import('./pages/user/user.component').then((m) => m.UserComponent),
                canActivate: [PublicPageGuard],
            },
        ],
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
    ],
    exports: [RouterModule],
})
export class LandingRoutingModule {}
