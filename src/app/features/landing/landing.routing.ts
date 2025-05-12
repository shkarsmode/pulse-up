import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './landing.component';
import { AppRoutes } from '../../shared/enums/app-routes.enum';
import { FooterGuard } from '../../shared/components/footer/footer.guard';
import { FooterCleanupGuard } from '../../shared/components/footer/footerCleanup.guard';
import { HeaderGuard } from '@/app/shared/components/header/header.guard';
import { HeaderCleanupGuard } from '@/app/shared/components/header/header-cleanup.guard';
import { metaTagsData } from '@/assets/data/meta-tags';

let Landing = AppRoutes.Landing;

const routes: Routes = [
    {
        path: '',
        component: LandingComponent,
        
        children: [
            {
                path: Landing.HOME,
                loadComponent: () => import('./pages/main/main.component').then((m) => m.MainComponent),
                canActivate: [HeaderGuard],
                canDeactivate: [HeaderCleanupGuard],
                data: metaTagsData.home,
            },
            {
                path: Landing.MAP,
                loadComponent: () => import('./pages/map-page/map-page.component').then((m) => m.MapPageComponent),
                canActivate: [FooterGuard],
                canDeactivate: [FooterCleanupGuard],
            },
            {
                path: Landing.TOPICS,
                loadComponent: () => import('./pages/pulses/pulses.component').then((m) => m.PulsesComponent),
                data: metaTagsData.topics,
            },
            {
                path: Landing.TOPIC,
                loadComponent: () => import('./pages/pulse-page/pulse-page.component').then((m) => m.PulsePageComponent),
            },
            {
                path: Landing.HEATMAP,
                loadComponent: () => import('./pages/pulse-heatmap-page/pulse-heatmap-page.component').then((m) => m.PulseHeatmapPageComponent),
            },
            {
                path: Landing.ABOUT,
                loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent),
            },
            {
                path: Landing.USER,
                loadComponent: () => import('./pages/user/user.component').then((m) => m.UserComponent),
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
