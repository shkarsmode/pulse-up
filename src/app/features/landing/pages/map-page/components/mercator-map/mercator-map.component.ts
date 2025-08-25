import { Component, effect, EventEmitter, inject, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { toSignal } from "@angular/core/rxjs-interop";
import { AngularSvgIconModule } from "angular-svg-icon";
import { IMapMarker } from "@/app/shared/interfaces/map/map-marker.interface";
import { MediaQueryService } from "@/app/shared/services/core/media-query.service";
import { ResponsiveMapConfig } from "@/app/shared/interfaces/responsive-map-config.interface";
import { MapComponent } from "@/app/shared/components/map/map.component";
import { MapHexagonsLayerComponent } from "@/app/shared/components/map/map-hexagons-layer/map-hexagons-layer.component";
import { MapHeatmapLayerComponent } from "@/app/shared/components/map/map-heatmap-layer/map-heatmap-layer.component";
import { MapZoomControlsComponent } from "@/app/shared/components/map/map-zoom-controls/map-zoom-controls.component";
import { MapControlsComponent } from "@/app/shared/components/map/map-controls/map-controls.component";
import { MapPageService } from "../../map-page.service";

@Component({
    selector: "app-mercator-map",
    templateUrl: "./mercator-map.component.html",
    styleUrl: "./mercator-map.component.scss",
    standalone: true,
    imports: [
        CommonModule,
        MapComponent,
        AngularSvgIconModule,
        MapHexagonsLayerComponent,
        MapHeatmapLayerComponent,
        MapZoomControlsComponent,
        MapControlsComponent,
    ],
})
export class MercatorMapComponent {
    private mediaService = inject(MediaQueryService);
    private mapPageService = inject(MapPageService);

    @Output() zoomEnd: EventEmitter<number> = new EventEmitter<number>();
    @Output() markerClick: EventEmitter<IMapMarker> = new EventEmitter<IMapMarker>();

    private isMobile = toSignal(this.mediaService.mediaQuery("max", "SM"));
    private isLaptop = toSignal(this.mediaService.mediaQuery("max", "XL"));
    private readonly configMap: Record<"mobile" | "laptop" | "default", ResponsiveMapConfig> = {
        mobile: {
            zoom: [2],
            minZoom: 2,
            maxBounds: [
                [-150, -85],
                [164, 85],
            ],
        },
        laptop: {
            zoom: [2.8],
            minZoom: 2.8,
            maxBounds: [
                [-164, -85],
                [150, 85],
            ],
        },
        default: {
            zoom: [1],
            minZoom: 1,
            maxBounds: [
                [-180, -80],
                [180, 85],
            ],
        },
    };

    public map: mapboxgl.Map | null = null;
    public zoom: [number] = this.configMap.default.zoom;
    public minZoom: number = this.configMap.default.minZoom;
    public maxBounds: mapboxgl.LngLatBoundsLike = this.configMap.default.maxBounds;
    public center: [number, number] = [-100.661, 37.7749];
    public selectedCategory$ = this.mapPageService.selectedCategory$;

    constructor() {
        effect(() => {
            const config = this.isMobile()
                ? this.configMap.mobile
                : this.isLaptop()
                  ? this.configMap.laptop
                  : this.configMap.default;

            this.zoom = config.zoom;
            this.minZoom = config.minZoom;
            this.maxBounds = config.maxBounds;
            this.center = [...this.center];
        });
    }

    public onMapLoaded(map: mapboxgl.Map): void {
        this.map = map;
    }

    public onMarkerClick(marker: IMapMarker): void {
        this.markerClick.emit(marker);
    }

    public onZoomEnd(zoom: number): void {
        this.zoomEnd.emit(zoom);
    }
}
