import { Component, EventEmitter, Input, Output, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgxMapboxGLModule } from "ngx-mapbox-gl";
import { ITopic } from "@/app/shared/interfaces";
import {
    IMapMarkerAnimated,
    IMapMarkerVisibilityEventData,
} from "@/app/shared/interfaces/map/map-marker.interface";
import { MapPopoverComponent } from "../map-popover/map-popover.component";
import { MapMarkerIconComponent } from "../map-marker-icon/map-marker-icon.component";
import { RouterModule } from "@angular/router";
import { TopPulseCardComponent } from "../../pulses/top-pulse/top-pulse-card.component";
import { SpinnerComponent } from "../../ui-kit/spinner/spinner.component";

@Component({
    selector: "app-map-marker",
    standalone: true,
    imports: [CommonModule, NgxMapboxGLModule, MapPopoverComponent, MapMarkerIconComponent, RouterModule, TopPulseCardComponent, SpinnerComponent],
    templateUrl: "./map-marker.component.html",
    styleUrl: "./map-marker.component.scss",
})
export class MapMarkerComponent implements OnInit {
    @Input() map: mapboxgl.Map | null = null;
    @Input() marker: IMapMarkerAnimated;
    @Input() tooltipData: ITopic | null;
    @Input() showTooltipOnHover = true;
    @Input() isAnimated = false;

    @Output() tooltipHideEnd: EventEmitter<void> = new EventEmitter<void>();
    @Output() markerClick: EventEmitter<IMapMarkerAnimated> =
        new EventEmitter<IMapMarkerAnimated>();
    @Output() markerHover: EventEmitter<IMapMarkerAnimated> =
        new EventEmitter<IMapMarkerAnimated>();
    @Output() visibilityChange: EventEmitter<IMapMarkerVisibilityEventData> =
        new EventEmitter<IMapMarkerVisibilityEventData>();

    private isVisible = true;

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
        }
    }

    public opacity = 0;

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
