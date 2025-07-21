import { IMapClickEvent } from "@/app/features/landing/helpers/interfaces/map-click-event.interface";
import { MapEventListenerService } from "@/app/features/landing/services/map-event-listener.service";
import { MapComponent } from "@/app/features/landing/ui/map/map.component";
import { OpenGetAppPopupDirective } from "@/app/shared/components/popups/get-app-popup/open-get-app-popup.directive";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { SecondaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/secondary-button/secondary-button.component";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { MediaQueryService } from "@/app/shared/services/core/media-query.service";
import { Component, effect, ElementRef, inject, ViewChild } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { Router, RouterModule } from "@angular/router";
import mapboxgl from "mapbox-gl";

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

    @ViewChild("mapWrapper", { static: true }) mapWrapperRef!: ElementRef;

    private is1400Desctop = toSignal(this.mediaService.mediaQuery("max", "XXL"));
    private is1200Desctop = toSignal(this.mediaService.mediaQuery("max", "XL"));
    private isTablet = toSignal(this.mediaService.mediaQuery("max", "MD"));
    private isXSMobile = toSignal(this.mediaService.mediaQuery("max", "XS"));
    private isXXSMobile = toSignal(this.mediaService.mediaQuery("max", "XXS"));
    private isXXXSMobile = toSignal(this.mediaService.mediaQuery("max", "XXXS"));

    private map: mapboxgl.Map | null = null;
    private startX = 0;
    private startY = 0;
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

    ngAfterViewInit() {
        // Disable map rotation vertically
        const el = this.mapWrapperRef.nativeElement;

        el.addEventListener(
            "touchstart",
            (e: any) => {
                this.startX = e.touches[0].clientX;
                this.startY = e.touches[0].clientY;
            },
            { passive: true },
        );

        el.addEventListener(
            "touchmove",
            (e: any) => {
                const dx = Math.abs(e.touches[0].clientX - this.startX);
                const dy = Math.abs(e.touches[0].clientY - this.startY);
                
                if (dx > dy) {
                    this.map?.dragPan.enable();
                } else {
                    this.map?.dragPan.disable();
                }
            },
            { passive: false },
        );
    }

    public onMapLoaded(map: mapboxgl.Map) {
        this.map = map;
    }

    public onMapClick({coordinates}: IMapClickEvent) {
        this.mapEventListenerService.onMapClick({ coordinates });
        this.navigateToMapPage();
    }

    private navigateToMapPage() {
        this.router.navigateByUrl(`/${this.AppRoutes.Landing.MAP}`);
    }
}
