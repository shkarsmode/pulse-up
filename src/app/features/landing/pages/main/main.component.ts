import { Component } from '@angular/core';
import { MainHeroComponent } from './components/main-hero/main-hero.component';
import { TopPulsesComponent } from './components/top-pulses/top-pulses.component';
import { AboutSectionComponent } from './components/about-section/about-section.component';
import { AdBannerComponent } from '@/app/shared/components/banners/ad-banner/ad-banner.component';



@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrl: './main.component.scss',
    standalone: true,
    imports: [
        AdBannerComponent,
        MainHeroComponent,
        TopPulsesComponent,
        AboutSectionComponent,
    ]
})
export class MainComponent { }
