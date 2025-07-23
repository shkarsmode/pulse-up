import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { first, Observable, tap } from "rxjs";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { MapUtils } from "@/app/features/landing/services/map-utils.service";
import { AppConstants } from "@/app/shared/constants";
import {
    IMapMarker,
    IMapMarkerVisibilityEventData,
} from "@/app/shared/interfaces/map-marker.interface";
import { MediaUtilsService } from "@/app/features/landing/services/media-utils.service";
import { MapMarkersService } from "@/app/shared/services/map/map-marker.service";
import { NgxMapboxGLModule } from "ngx-mapbox-gl";
import { throttle } from "@/app/shared/helpers/throttle";
import { MapMarkerComponent } from "../map-marker/map-marker.component";
import { MapBounds } from "@/app/features/landing/helpers/interfaces/map-bounds.interface";
import { TopCellTopicsByH3Index } from "@/app/features/landing/helpers/interfaces/h3-pulses.interface";

@Component({
    selector: "app-map-markers-layer",
    templateUrl: "./map-markers-layer.component.html",
    styleUrl: "./map-markers-layer.component.scss",
    standalone: true,
    imports: [CommonModule, NgxMapboxGLModule, MapMarkerComponent],
})
export class MapMarkersLayerComponent {
    private readonly pulseService = inject(PulseService);
    private readonly mapMarkersService = inject(MapMarkersService);

    @Input() map: mapboxgl.Map;
    @Input() showTooltip: boolean = false;
    @Input() isAnimated: boolean = false;
    @Output() public markerClick = new EventEmitter<IMapMarker>();

    markers$ = this.mapMarkersService.markers$;
    tooltipData$ = this.mapMarkersService.tooltipData$;
    tooltipData = this.mapMarkersService.tooltipDataValue;
    isTouchDevice = false;

    ngOnInit() {
        this.updateMarkers();
        this.map.on("zoomend", this.updateMarkers);
        this.map.on("move", throttle(this.updateMarkers, 500));
        this.checkIfTouchDevice();
    }

    onMarkerClick(marker: IMapMarker): void {
        if (!this.isTouchDevice) {
            this.mapMarkersService.hideTooltip();
            this.markerClick.emit(marker);
            return;
        }

        const theSameMarker = this.tooltipData?.markerId === marker.id;

        if (theSameMarker) {
            this.mapMarkersService.hideTooltip();
            // this.markerClick.emit(marker);
        } else {
            this.onMarkerHover(marker);
        }
    }

    onMarkerHover(marker: IMapMarker): void {
        this.mapMarkersService.handleMarkerHover(marker);
    }

    onTooltipHide(): void {
        this.tooltipData = null;
    }

    onMarkerVisibilityChange(marker: IMapMarkerVisibilityEventData): void {
        if (this.tooltipData?.markerId === marker.id && !marker.isVisible) {
            this.mapMarkersService.hideTooltip();
        }
    }

    private updateMarkers = (): void => {
        const resolution = MapUtils.getResolutionLevel({
            map: this.map,
            resolutionLevelsByZoom: AppConstants.ZOOM_RESOLUTION_MAP,
        });

        const bounds = MapUtils.getMapBounds({
            map: this.map,
        });

        this.getH3Pulses({ bounds, resolution })
            .pipe(
                first(),
                tap((data) => {
                    console.log("Markers data:", data);
                    
                }),
                tap((data) => this.mapMarkersService.updateMarkers(data)),
            )
            .subscribe();
    };

    private getH3Pulses({
        bounds,
        resolution,
    }: {
        bounds: MapBounds;
        resolution: number;
    }): Observable<TopCellTopicsByH3Index> {
        const { ne, sw } = bounds;
        return this.pulseService.getH3PulsesForMap(ne.lat, ne.lng, sw.lat, sw.lng, resolution);
    }

    private checkIfTouchDevice(): void {
        this.isTouchDevice = MediaUtilsService.checkIfTouchDevice();
    }
}
