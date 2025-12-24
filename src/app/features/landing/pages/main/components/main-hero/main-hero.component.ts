import { MapHeatmapLayerComponent } from "@/app/shared/components/map/map-heatmap-layer/map-heatmap-layer.component";
import { MapHexagonsLayerComponent } from "@/app/shared/components/map/map-hexagons-layer/map-hexagons-layer.component";
import { MapComponent } from "@/app/shared/components/map/map.component";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { SecondaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/secondary-button/secondary-button.component";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { MediaQueryService } from "@/app/shared/services/core/media-query.service";
import { GlobeSpinnerService } from "@/app/shared/services/map/globe-spinner.service";
import { MAPBOX_STYLE_WITH_BACKGROUND } from '@/app/shared/tokens/tokens';
import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, effect, ElementRef, inject, ViewChild } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { Router, RouterModule } from "@angular/router";
import mapboxgl, { EventData, MapStyleDataEvent } from "mapbox-gl";

@Component({
    selector: "app-main-hero",
    templateUrl: "./main-hero.component.html",
    styleUrls: ["./main-hero.component.scss"],
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        PrimaryButtonComponent,
        SecondaryButtonComponent,
        MapComponent,
        MapHexagonsLayerComponent,
        MapHeatmapLayerComponent,
    ],
})
export class MainHeroComponent implements AfterViewInit {
    private router = inject(Router);
    private mediaService = inject(MediaQueryService);
    private globeSpinnerService = new GlobeSpinnerService();
    public mapStylesUrl = inject(MAPBOX_STYLE_WITH_BACKGROUND);

    @ViewChild("mapWrapper", { static: true }) mapWrapperRef!: ElementRef<HTMLDivElement>;

    private is1400Desctop = toSignal(this.mediaService.mediaQuery("max", "XXL"));
    private is1200Desctop = toSignal(this.mediaService.mediaQuery("max", "XL"));
    private isTablet = toSignal(this.mediaService.mediaQuery("max", "MD"));
    private isXSMobile = toSignal(this.mediaService.mediaQuery("max", "XS"));
    private isXXSMobile = toSignal(this.mediaService.mediaQuery("max", "XXS"));
    private isXXXSMobile = toSignal(this.mediaService.mediaQuery("max", "XXXS"));

    private startX = 0;
    private startY = 0;
    public map: mapboxgl.Map | null = null;
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
            (e) => {
                this.startX = e.touches[0].clientX;
                this.startY = e.touches[0].clientY;
            },
            { passive: true },
        );

        el.addEventListener(
            "touchmove",
            (e) => {
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
        // this.map.setFog(this.fog);
        this.globeSpinnerService.init(this.map);
        this.globeSpinnerService.start();
    }

    public onStyleData(style: MapStyleDataEvent & EventData): void {
        const map = style.target;
        const layers = map.getStyle().layers;
        if (!layers) return;
        for (const layer of layers) {
            if (layer.type === "symbol") {
                map.setLayoutProperty(layer.id, "visibility", "none");
            }
        }
    }

    public onMapClick() {
        this.navigateToMapPage();
    }

    private navigateToMapPage() {
        this.router.navigateByUrl(`/${this.AppRoutes.Landing.MAP}`);
    }
}
