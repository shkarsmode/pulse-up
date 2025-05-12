import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { PulsePageComponent } from './pages/pulse-page/pulse-page.component';
import { PulsesComponent } from './pages/pulses/pulses.component';
import { LandingComponent } from './landing.component';
import { AppRoutes } from '../../shared/enums/app-routes.enum';
import { MapPageComponent } from './pages/map-page/map-page.component';
import { PulseHeatmapPageComponent } from './pages/pulse-heatmap-page/pulse-heatmap-page.component';
import { FooterGuard } from '../../shared/components/footer/footer.guard';
import { FooterCleanupGuard } from '../../shared/components/footer/footerCleanup.guard';
import { AboutComponent } from './pages/about/about.component';
import { HeaderGuard } from '@/app/shared/components/header/header.guard';
import { HeaderCleanupGuard } from '@/app/shared/components/header/header-cleanup.guard';
import { metaTagsData } from '@/assets/data/meta-tags';
import { UserComponent } from './pages/user/user.component';

let Landing = AppRoutes.Landing;

const routes: Routes = [
    {
        path: '',
        component: LandingComponent,
        
        children: [
            {
                path: Landing.HOME,
                component: MainComponent,
                canActivate: [HeaderGuard],
                canDeactivate: [HeaderCleanupGuard],
                data: metaTagsData.home,
            },
            {
                path: Landing.MAP,
                component: MapPageComponent,
                canActivate: [FooterGuard],
                canDeactivate: [FooterCleanupGuard],
            },
            {
                path: Landing.TOPICS,
                component: PulsesComponent,
                data: metaTagsData.topics,
            },
            {
                path: Landing.TOPIC,
                component: PulsePageComponent,
            },
            {
                path: Landing.HEATMAP,
                component: PulseHeatmapPageComponent,
            },
            {
                path: Landing.ABOUT,
                component: AboutComponent,
            },
            {
                path: Landing.USER,
                component: UserComponent,
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
