import { AfterViewInit, Component, ElementRef, ViewChild } from "@angular/core";
import { MainHeroComponent } from "./components/main-hero/main-hero.component";
import { TopPulsesComponent } from "./components/top-pulses/top-pulses.component";
import { AboutSectionComponent } from "./components/about-section/about-section.component";
import { AdBannerComponent } from "@/app/shared/components/banners/ad-banner/ad-banner.component";
import { MobileAppBannerComponent } from "../../ui/mobile-app-banner/mobile-app-banner.component";

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
        MobileAppBannerComponent,
    ],
})
export class MainComponent implements AfterViewInit {
    @ViewChild("appAdBanner", { read: ElementRef })
    adBannerRef!: ElementRef;

    public mobileAppBannerVisible = true;

    ngAfterViewInit() {
        const observer = new IntersectionObserver(
            ([entry]) => {
                this.mobileAppBannerVisible = entry.isIntersecting;
                if (entry.isIntersecting) {
                    console.log("Ad Banner is visible");
                    console.log("mobileAppBannerVisible", this.mobileAppBannerVisible);
                    
                } else {
                    console.log("Ad Banner is not visible");
                    console.log("mobileAppBannerVisible", this.mobileAppBannerVisible);
                }
            },
            {
                root: null, // relative to viewport
                threshold: 0.1, // adjust based on how much of it should be visible
            },
        );

        if (this.adBannerRef?.nativeElement) {
            observer.observe(this.adBannerRef.nativeElement);
        }
    }
}
