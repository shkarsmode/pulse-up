import { Component, DestroyRef, EventEmitter, inject, Input, Output, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
    combineLatest,
    fromEvent,
    merge,
    Observable,
    startWith,
    switchMap,
    tap,
    throttleTime,
} from "rxjs";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { MapUtils } from "@/app/shared/services/map/map-utils.service";
import { AppConstants } from "@/app/shared/constants";
import {
    IMapMarker,
    IMapMarkerVisibilityEventData,
} from "@/app/shared/interfaces/map/map-marker.interface";
import { MediaUtilsService } from "@/app/features/landing/services/media-utils.service";
import { MapMarkersService } from "@/app/shared/services/map/map-marker.service";
import { NgxMapboxGLModule } from "ngx-mapbox-gl";
import { MapMarkerComponent } from "../map-marker/map-marker.component";
import { IH3Pulses } from "@/app/features/landing/helpers/interfaces/h3-pulses.interface";
import { ICategory } from "@/app/shared/interfaces/category.interface";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
    selector: "app-map-markers-layer",
    templateUrl: "./map-markers-layer.component.html",
    styleUrl: "./map-markers-layer.component.scss",
    standalone: true,
    imports: [CommonModule, NgxMapboxGLModule, MapMarkerComponent],
})
export class MapMarkersLayerComponent implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
    private readonly pulseService = inject(PulseService);
    private readonly mapMarkersService = inject(MapMarkersService);

    @Input() public map: mapboxgl.Map;
    @Input() public showTooltip = false;
    @Input() public isAnimated = false;

    @Output() public markerClick = new EventEmitter<IMapMarker>();

    public readonly markers$ = this.mapMarkersService.markers$;
    public readonly tooltipData$ = this.mapMarkersService.tooltipData$;
    public tooltipData = this.mapMarkersService.tooltipDataValue;
    public isTouchDevice = false;

    ngOnInit() {
        this.checkIfTouchDevice();
        combineLatest([this.mapInteraction$(), this.mapMarkersService.category$])
            .pipe(
                switchMap(([, category]) => this.getMarkers(category)),
                tap((data) => {
                    this.mapMarkersService.updateMarkers(data);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    public onMarkerClick(marker: IMapMarker): void {
        if (!this.isTouchDevice) {
            this.mapMarkersService.hideTooltip();
            this.markerClick.emit(marker);
            return;
        }

        const theSameMarker = this.tooltipData?.markerId === marker.id;

        if (theSameMarker) {
            this.mapMarkersService.hideTooltip();
        } else {
            this.onMarkerHover(marker);
        }
    }

    public onMarkerHover(marker: IMapMarker): void {
        this.mapMarkersService.handleMarkerHover(marker);
    }

    public onTooltipHide(): void {
        this.tooltipData = null;
    }

    public onMarkerVisibilityChange(marker: IMapMarkerVisibilityEventData): void {
        if (this.tooltipData?.markerId === marker.id && !marker.isVisible) {
            this.mapMarkersService.hideTooltip();
        }
    }

    public trackByMarker(marker: IMapMarker): string {
        return `${marker.h3Index}-${marker.topicId}`;
    }

    private mapInteraction$(): Observable<Event | null> {
        return merge(
            fromEvent(this.map, "zoomend"),
            fromEvent(this.map, "move").pipe(throttleTime(500)),
        ).pipe(startWith(null));
    }

    private getMarkers(category: ICategory | null): Observable<IH3Pulses> {
        const resolution = MapUtils.getResolutionLevel({
            map: this.map,
            resolutionLevelsByZoom: AppConstants.ZOOM_RESOLUTION_MAP,
        });

        const bounds = MapUtils.getMapBounds({ map: this.map });

        const { ne, sw } = bounds;
        return this.pulseService.getH3PulsesForMap({
            NElatitude: ne.lat,
            NElongitude: ne.lng,
            SWlatitude: sw.lat,
            SWlongitude: sw.lng,
            resolution,
            category: category?.name,
        });
    }

    private checkIfTouchDevice(): void {
        this.isTouchDevice = MediaUtilsService.checkIfTouchDevice();
    }
}
