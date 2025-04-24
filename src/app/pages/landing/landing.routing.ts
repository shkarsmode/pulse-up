import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './components/main/main.component';
import { PulsePageComponent } from './components/pulse-page/pulse-page.component';
import { PulsesComponent } from './components/pulses/pulses.component';
import { LandingComponent } from './landing.component';
import { AppRoutes } from '../../shared/enums/app-routes.enum';
import { MapPageComponent } from './components/map-page/map-page.component';
import { PulseHeatmapPageComponent } from './components/pulse-heatmap-page/pulse-heatmap-page.component';
import { FooterGuard } from '../../shared/components/footer/footer.guard';
import { FooterCleanupGuard } from '../../shared/components/footer/footerCleanup.guard';
import { metaTagsData } from '@/assets/data/meta-tags';

let Landing = AppRoutes.Landing;

const routes: Routes = [
    {
        path: '',
        component: LandingComponent,
        
        children: [
            {
                path: Landing.HOME,
                component: MainComponent,
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
