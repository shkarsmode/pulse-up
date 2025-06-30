import { Component, effect, EventEmitter, inject, Output } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { IMapMarker } from "@/app/shared/interfaces/map-marker.interface";
import { MediaQueryService } from "@/app/shared/services/core/media-query.service";
import { ResponsiveMapConfig } from "@/app/shared/interfaces/responsive-map-config.interface";
import { MapComponent } from "@/app/shared/components/map/map.component";
import { MapHexagonsLayerComponent } from "@/app/shared/components/map/map-hexagons-layer/map-hexagons-layer.component";

@Component({
    selector: "app-mercator-map",
    templateUrl: "./mercator-map.component.html",
    styleUrl: "./mercator-map.component.scss",
    standalone: true,
    imports: [MapComponent, MapHexagonsLayerComponent],
})
export class MercatorMapComponent {
    private mediaService = inject(MediaQueryService);

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

    map: mapboxgl.Map | null = null;
    zoom: [number] = this.configMap.default.zoom;
    minZoom: number = this.configMap.default.minZoom;
    maxBounds: mapboxgl.LngLatBoundsLike = this.configMap.default.maxBounds;
    center: [number, number] = [-100.661, 37.7749];

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

    onMapLoaded(map: mapboxgl.Map): void {
        this.map = map;
    }

    onMarkerClick(marker: IMapMarker): void {
        this.markerClick.emit(marker);
    }

    onZoomEnd(zoom: number): void {
        this.zoomEnd.emit(zoom);
    }
}
