import { CommonModule } from "@angular/common";
import { Component, EventEmitter, HostBinding, inject, Input, Output } from "@angular/core";
import { NgxMapboxGLModule } from "ngx-mapbox-gl";
import { EventData, MapStyleDataEvent } from "mapbox-gl";
import { throttle } from "@/app/shared/helpers/throttle";
import { MAPBOX_STYLE } from "../../tokens/tokens";
import { AppConstants } from "../../constants";
import { MapMarkersLayerComponent } from "./map-markers-layer/map-markers-layer.component";
import { IMapMarker } from "../../interfaces/map-marker.interface";
import { IMapClickEvent } from "@/app/features/landing/helpers/interfaces/map-click-event.interface";

interface MarkersSettings {
    enabled?: boolean;
    showTooltip?: boolean;
    isAnimated?: boolean;
}

@Component({
    selector: "app-map",
    standalone: true,
    imports: [CommonModule, NgxMapboxGLModule, MapMarkersLayerComponent],
    templateUrl: "./map.component.html",
    styleUrl: "./map.component.scss",
})
export class MapComponent {
    private readonly mapboxStylesUrl = inject(MAPBOX_STYLE);

    @Input() isRounded = false;
    @Input() isPreview = false;
    @Input() isScrollZoomEnabled = true;
    @Input() isDoubleClickZoomEnabled = true;
    @Input() touchPitch = true;
    @Input() touchZoomRotate = true;
    @Input() markers: MarkersSettings = {
        enabled: false,
        showTooltip: false,
        isAnimated: false,
    };
    @Input() center: [number, number] = AppConstants.MAP_CENTER_COORDINATES;
    @Input() maxBounds: mapboxgl.LngLatBoundsLike | undefined = AppConstants.MAP_MAX_BOUNDS;
    @Input() zoom: [number] = [1];
    @Input() minZoom = 1;
    @Input() maxZoom: number = AppConstants.MAP_MAX_ZOOM;
    @Input() mapStylesUrl: string = this.mapboxStylesUrl;
    @Input() projection: mapboxgl.Projection["name"] = "mercator";

    @Output() zoomEnd = new EventEmitter<number>();
    @Output() mapLoaded = new EventEmitter<mapboxgl.Map>();
    @Output() move = new EventEmitter<void>();
    @Output() mapClick = new EventEmitter<IMapClickEvent>();
    @Output() markerClick = new EventEmitter<IMapMarker>();
    @Output() touchStart = new EventEmitter<mapboxgl.MapTouchEvent & mapboxgl.EventData>();
    @Output() mapStyleData = new EventEmitter<MapStyleDataEvent & EventData>();

    @HostBinding("class.preview")
    get isPreviewMap() {
        return this.isPreview;
    }

    map: mapboxgl.Map | null = null;

    onMapLoad({ target: map }: mapboxgl.MapboxEvent<undefined> & mapboxgl.EventData) {
        this.map = map;
        this.map.dragRotate?.disable();
        this.map.touchZoomRotate.disableRotation();
        this.mapLoaded.next(this.map);
    }

    handleZoomEnd = () => {
        this.zoomEnd.emit(this.map?.getZoom() || 0);
    };

    handleMove = throttle(() => {
        this.move.next();
    }, 500);

    handleMapClick = (event: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
        if (event.lngLat) {
            this.mapClick.emit({
                coordinates: { lat: event.lngLat.lat, lng: event.lngLat.lng },
            });
        }
    };

    handleTouchStart(event: mapboxgl.MapTouchEvent & mapboxgl.EventData) {
        this.touchStart.emit(event);
    }

    onStyleData(style: MapStyleDataEvent & EventData): void {
        this.mapStyleData.emit(style);
    }

    onMarkerClick(marker: IMapMarker) {
        this.markerClick.emit(marker);
    }
}
