import { AdBannerComponent } from "@/app/shared/components/banners/ad-banner/ad-banner.component";
import { Component } from "@angular/core";
import { LandingPageLayoutComponent } from "../../ui/landing-page-layout/landing-page-layout.component";
import { AboutSectionComponent } from "./components/about-section/about-section.component";
import { MainHeroComponent } from "./components/main-hero/main-hero.component";
import { TopPulsesComponent } from "./components/top-pulses/top-pulses.component";

@Component({
    selector: "app-main",
    templateUrl: "./main.component.html",
    styleUrl: "./main.component.scss",
    standalone: true,
    imports: [
        AdBannerComponent,
        MainHeroComponent,
        TopPulsesComponent,
        AboutSectionComponent,
        LandingPageLayoutComponent,
    ],
})
export class MainComponent {
}
