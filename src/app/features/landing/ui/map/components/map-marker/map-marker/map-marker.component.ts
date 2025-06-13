import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { Component, EventEmitter, inject, Input, OnInit, Output } from "@angular/core";
import { NgxMapboxGLModule } from "ngx-mapbox-gl";
import mapboxgl from "mapbox-gl";
import {
    IMapMarkerAnimated,
    IMapMarkerVisibilityEventData,
} from "@/app/shared/interfaces/map-marker.interface";
import { MarkerIconComponent } from "../../map-marker-icon/marker-icon.component";
import { TopPulseCardComponent } from "@/app/shared/components/pulses/top-pulse/top-pulse-card.component";
import { IPulse } from "@/app/shared/interfaces";
import { SpinnerComponent } from "@/app/shared/components/ui-kit/spinner/spinner.component";
import { MapMarkersService } from "@/app/features/landing/services/map-markers.service";
import { MapPopoverComponent } from "../../map-popover/map-popover.component";

@Component({
    selector: "app-map-marker",
    templateUrl: "./map-marker.component.html",
    styleUrl: "./map-marker.component.scss",
    standalone: true,
    imports: [
    CommonModule,
    RouterModule,
    NgxMapboxGLModule,
    MarkerIconComponent,
    TopPulseCardComponent,
    SpinnerComponent,
    MapPopoverComponent
],
})
export class MapMarkerComponent implements OnInit {
    @Input() marker: IMapMarkerAnimated;
    @Input() tooltipData: IPulse | null;
    @Input() showTooltipOnHover: boolean = true;
    @Input() isAnimated: boolean = false;
    @Input() map: mapboxgl.Map | null = null;

    @Output() tooltipHideEnd: EventEmitter<void> = new EventEmitter<void>();
    @Output() markerClick: EventEmitter<IMapMarkerAnimated> =
        new EventEmitter<IMapMarkerAnimated>();
    @Output() markerHover: EventEmitter<IMapMarkerAnimated> =
        new EventEmitter<IMapMarkerAnimated>();
    @Output() visibilityChange: EventEmitter<IMapMarkerVisibilityEventData> =
        new EventEmitter<IMapMarkerVisibilityEventData>();

    private readonly mapMarkersService: MapMarkersService = inject(MapMarkersService);

    private isVisible: boolean = true;

    ngOnInit(): void {
        this.map?.on("moveend", this.checkMarkerVisibility.bind(this));
    }

    private checkMarkerVisibility(): void {
        if (!this.map) return;
        const center = this.map.getCenter();
        const bounds = this.map.getBounds();
        const visibleBounds = {
            ne: {
                lng: Math.min(bounds.getNorthEast().lng, center.lng + 90, 180),
                lat: Math.min(bounds.getNorthEast().lat, 90),
            },
            sw: {
                lng: Math.max(bounds.getSouthWest().lng, center.lng - 90, -180),
                lat: Math.max(bounds.getSouthWest().lat, -90),
            },
        };

        const isVisible =
            this.marker.lat <= visibleBounds.ne.lat &&
            this.marker.lat >= visibleBounds.sw.lat &&
            this.marker.lng <= visibleBounds.ne.lng &&
            this.marker.lng >= visibleBounds.sw.lng;

        if (this.isVisible !== isVisible) {
            this.isVisible = isVisible;
            this.visibilityChange.emit({
                ...this.marker,
                isVisible,
            });
        };
    }

    public opacity: number = 0;

    public onImageLoaded(): void {
        this.opacity = 1;
    }

    public onMarkerClick(): void {
        this.markerClick.emit(this.marker);
    }

    public onMarkerHover(): void {
        this.markerHover.emit(this.marker);
    }
    public onTooltipHideEnd(): void {
        this.tooltipHideEnd.emit();
    }
}
