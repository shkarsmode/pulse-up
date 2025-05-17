import { Component, effect, inject } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import mapboxgl from "mapbox-gl";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { MediaQueryService } from "@/app/shared/services/core/media-query.service";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { SecondaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/secondary-button/secondary-button.component";
import { MapComponent } from "@/app/features/landing/components/map/map.component";
import { OpenGetAppPopupDirective } from "@/app/shared/components/popups/get-app-popup/open-get-app-popup.directive";
import { MapEventListenerService } from "@/app/features/landing/services/map-event-listener.service";
import { IMapClickEvent } from "@/app/features/landing/interfaces/map-click-event.interface";

@Component({
    selector: "app-main-hero",
    templateUrl: "./main-hero.component.html",
    styleUrls: ["./main-hero.component.scss"],
    standalone: true,
    imports: [
        RouterModule,
        PrimaryButtonComponent,
        SecondaryButtonComponent,
        MapComponent,
        OpenGetAppPopupDirective,
    ],
})
export class MainHeroComponent {
    private router: Router = inject(Router);
    private mediaService: MediaQueryService = inject(MediaQueryService);
    private readonly mapEventListenerService: MapEventListenerService = inject(MapEventListenerService);

    private is1400Desctop = toSignal(this.mediaService.mediaQuery("max", "XXL"));
    private is1200Desctop = toSignal(this.mediaService.mediaQuery("max", "XL"));
    private isTablet = toSignal(this.mediaService.mediaQuery("max", "MD"));
    private isXSMobile = toSignal(this.mediaService.mediaQuery("max", "XS"));
    private isXXSMobile = toSignal(this.mediaService.mediaQuery("max", "XXS"));
    private isXXXSMobile = toSignal(this.mediaService.mediaQuery("max", "XXXS"));

    public AppRoutes = AppRoutes;
    public zoom = 1.5;
    public zoomResolutionMap = {
        0: 0,
        1: 1,
        2: 1,
        3: 1,
        3.3: 2,
        4: 2,
        5: 3,
        6.5: 4,
        7: 4,
        8: 5,
        9: 6,
        10: 6,
    };
    public fog: mapboxgl.Fog = {
        color: "rgb(228, 240, 255)",
        "high-color": "rgb(117, 172, 255)",
        "space-color": "rgb(2, 11, 27)",
        "star-intensity": ["interpolate", ["linear"], ["zoom"], 11, 0.35, 12, 0],
        "horizon-blend": 0.015,
    };

    constructor() {
        effect(() => {
            this.zoom = this.isXXXSMobile()
                ? 0.45
                : this.isXXSMobile()
                    ? 0.55
                    : this.isXSMobile()
                        ? 0.8
                        : this.isTablet()
                            ? 1
                            : this.is1200Desctop()
                                ? 0.8
                                : this.is1400Desctop()
                                    ? 1.5
                                    : 1.85;

            if (this.isTablet()) {
                this.zoomResolutionMap = { ...this.zoomResolutionMap, 1: 0 };
            } else {
                this.zoomResolutionMap = { ...this.zoomResolutionMap, 1: 1 };
            }
        });
    }

    public onMapClick({coordinates}: IMapClickEvent) {
        this.mapEventListenerService.onMapClick({ coordinates });
        this.navigateToMapPage();
    }

    private navigateToMapPage() {
        this.router.navigateByUrl(`/${this.AppRoutes.Landing.MAP}`);
    }
}
