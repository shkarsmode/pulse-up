import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { NgxMapboxGLModule } from "ngx-mapbox-gl";
import { NgxTooltip } from "@ngx-popovers/tooltip";
import { IMapMarkerAnimated } from "@/app/shared/interfaces/map-marker.interface";
import { MarkerIconComponent } from "../../map-marker-icon/marker-icon.component";
import { TopPulseCardComponent } from "@/app/shared/components/pulses/top-pulse/top-pulse-card.component";
import { IPulse } from "@/app/shared/interfaces";
import { SpinnerComponent } from "@/app/shared/components/ui-kit/spinner/spinner.component";

@Component({
    selector: "app-map-marker",
    templateUrl: "./map-marker.component.html",
    styleUrl: "./map-marker.component.scss",
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        NgxMapboxGLModule,
        NgxTooltip,
        MarkerIconComponent,
        TopPulseCardComponent,
        SpinnerComponent,
    ],
})
export class MapMarkerComponent {
    @Input() marker: IMapMarkerAnimated;
    @Input() tooltipData: IPulse | null;
    @Input() isTooltipVisible: boolean = true;
    @Input() isAnimated: boolean = false;

    @Output() tooltipHideEnd: EventEmitter<void> = new EventEmitter<void>();
    @Output() markerClick: EventEmitter<IMapMarkerAnimated> = new EventEmitter<IMapMarkerAnimated>();
    @Output() markerHover: EventEmitter<IMapMarkerAnimated> = new EventEmitter<IMapMarkerAnimated>();

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
