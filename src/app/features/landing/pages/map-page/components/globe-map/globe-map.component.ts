import { Component, effect, EventEmitter, inject, OnDestroy, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { toSignal } from "@angular/core/rxjs-interop";
import { BehaviorSubject } from "rxjs";
import mapboxgl from "mapbox-gl";
import { IMapMarker } from "@/app/shared/interfaces/map-marker.interface";
import { MediaQueryService } from "@/app/shared/services/core/media-query.service";
import { MapEventListenerService } from "@/app/features/landing/services/map-event-listener.service";
import { MapMarkersService } from "@/app/shared/services/map/map-marker.service";
import { MapComponent } from "@/app/shared/components/map/map.component";
import { MapHexagonsLayerComponent } from "@/app/shared/components/map/map-hexagons-layer/map-hexagons-layer.component";
import { MapHeatmapLayerComponent } from "@/app/shared/components/map/map-heatmap-layer/map-heatmap-layer.component";
import { MapZoomControlsComponent } from "@/app/shared/components/map/map-zoom-controls/map-zoom-controls.component";
import { MapControlsComponent } from "@/app/shared/components/map/map-controls/map-controls.component";
import { MapSpinControlComponent } from "@/app/shared/components/map/map-spin-control/map-spin-control.component";
import { CategoryFilterSelectComponent } from "@/app/shared/components/category-filter-select/category-filter-select.component";
import { ICategory } from "@/app/shared/interfaces/category.interface";
import { CategoryFilterMenuComponent } from "@/app/shared/components/category-filter-menu/category-filter-menu.component";

@Component({
    selector: "app-globe-map",
    templateUrl: "./globe-map.component.html",
    styleUrl: "./globe-map.component.scss",
    standalone: true,
    imports: [
        CommonModule,
        MapComponent,
        MapHexagonsLayerComponent,
        MapHeatmapLayerComponent,
        MapZoomControlsComponent,
        MapControlsComponent,
        MapSpinControlComponent,
        CategoryFilterSelectComponent,
        CategoryFilterMenuComponent,
    ],
})
export class GlobeMapComponent implements OnDestroy {
    private readonly mediaService = inject(MediaQueryService);
    private readonly mapEventListenerService = inject(MapEventListenerService);
    private readonly mapMarkersService = inject(MapMarkersService);

    private isMobile = toSignal(this.mediaService.mediaQuery("max", "SM"));
    private isMobileLandscape = toSignal(
        this.mediaService.mediaQuery({
            type: "max",
            breakPoint: "SM",
            orientation: "landscape",
            parameter: "height",
        }),
    );
    private isXSMobile = toSignal(this.mediaService.mediaQuery("max", "XS"));
    private isXSMobileLandscape = toSignal(
        this.mediaService.mediaQuery({
            type: "max",
            breakPoint: "XS",
            orientation: "landscape",
            parameter: "height",
        }),
    );
    private isXXSMobile = toSignal(this.mediaService.mediaQuery("max", "XXS"));
    private isXXSMobileLandscape = toSignal(
        this.mediaService.mediaQuery({
            type: "max",
            breakPoint: "XXS",
            orientation: "landscape",
            parameter: "height",
        }),
    );
    private isXXXSMobile = toSignal(this.mediaService.mediaQuery("max", "XXXS"));
    private isXXXSMobileLandscape = toSignal(
        this.mediaService.mediaQuery({
            type: "max",
            breakPoint: "XXXS",
            orientation: "landscape",
            parameter: "height",
        }),
    );
    private isMDLandscape = toSignal(
        this.mediaService.mediaQuery({
            type: "max",
            breakPoint: "MD",
            orientation: "landscape",
            parameter: "height",
        }),
    );
    private isLGDesctop = toSignal(this.mediaService.mediaQuery("max", "LG"));
    private isLGLandscape = toSignal(
        this.mediaService.mediaQuery({
            type: "max",
            breakPoint: "LG",
            orientation: "landscape",
            parameter: "height",
        }),
    );
    private is1400Desctop = toSignal(this.mediaService.mediaQuery("max", "XXL"));
    private is1600Desctop = toSignal(this.mediaService.mediaQuery("max", "XXXL"));
    private is1920Desctop = toSignal(this.mediaService.mediaQuery("max", "XXXXL"));
    private selectedCategorySubject = new BehaviorSubject<ICategory | null>(null);

    public map: mapboxgl.Map | null = null;
    public selectedCategory$ = this.selectedCategorySubject.asObservable();

    @Output() zoomEnd: EventEmitter<number> = new EventEmitter<number>();
    @Output() markerClick: EventEmitter<IMapMarker> = new EventEmitter<IMapMarker>();

    public zoom: number = 2.5;
    public fog: mapboxgl.Fog = {
        color: "rgb(228, 240, 255)",
        "high-color": "rgb(117, 172, 255)",
        "space-color": "rgb(2, 11, 27)",
        "star-intensity": ["interpolate", ["linear"], ["zoom"], 11, 0.35, 12, 0],
        "horizon-blend": 0.015,
    };

    constructor() {
        effect(() => {
            this.zoom = this.isXXXSMobileLandscape()
                ? 0.35
                : this.isXXXSMobile()
                ? 0.45
                : this.isXXSMobileLandscape()
                ? 0.35
                : this.isXXSMobile()
                ? 0.55
                : this.isXSMobileLandscape()
                ? 0.5
                : this.isXSMobile()
                ? 0.8
                : this.isMobileLandscape()
                ? 0.45
                : this.isMobile()
                ? 1
                : this.isLGDesctop()
                ? 1.2
                : this.is1400Desctop()
                ? 1.4
                : this.is1600Desctop()
                ? 1.6
                : this.is1920Desctop()
                ? 1.85
                : this.isMDLandscape()
                ? 0.8
                : this.isLGLandscape()
                ? 0.7
                : 2;
        });
    }

    ngOnDestroy(): void {
        this.mapMarkersService.category = null;
        this.mapMarkersService.clearMarkers();
    }

    public onMapLoaded(map: mapboxgl.Map): void {
        this.map = map;
        this.map.setFog(this.fog);
        this.flyToCoordinates();
    }

    public onMarkerClick(marker: IMapMarker): void {
        this.markerClick.emit(marker);
    }

    public onZoomEnd(zoom: number): void {
        this.zoomEnd.emit(zoom);
    }

    public onSelectedCategory(category: ICategory | null): void {
        this.selectedCategorySubject.next(category);
        this.mapMarkersService.category = category;
    }

    private flyToCoordinates() {
        const coordinates = this.mapEventListenerService.selectedCoordinates;
        if (coordinates) {
            this.map?.flyTo({
                center: [coordinates.lng, coordinates.lat],
                zoom: 2.5,
                speed: 0.4,
            });
        }
    }
}
