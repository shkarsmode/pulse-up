import { Component, inject, OnInit } from "@angular/core";
import { MainHeroComponent } from "./components/main-hero/main-hero.component";
import { TopPulsesComponent } from "./components/top-pulses/top-pulses.component";
import { AboutSectionComponent } from "./components/about-section/about-section.component";
import { AdBannerComponent } from "@/app/shared/components/banners/ad-banner/ad-banner.component";
import { CollectUserInfoService } from "../../services/collect-user-info.service";

@Component({
    selector: "app-main",
    templateUrl: "./main.component.html",
    styleUrl: "./main.component.scss",
    standalone: true,
    imports: [AdBannerComponent, MainHeroComponent, TopPulsesComponent, AboutSectionComponent],
})
export class MainComponent implements OnInit {
    private collectUserInfoService = inject(CollectUserInfoService);
    ngOnInit(): void {
        this.collectUserInfoService.collectPersonalInfo();
    }
}
