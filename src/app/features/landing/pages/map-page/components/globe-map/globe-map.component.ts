import { Component, effect, EventEmitter, inject, Output } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { IMapMarker } from "@/app/shared/interfaces/map-marker.interface";
import { MediaQueryService } from "@/app/shared/services/core/media-query.service";
import { MapComponent } from "@/app/features/landing/components/map/map.component";
import { MAPBOX_WITH_BACKGROUND_STYLE } from "@/app/shared/tokens/tokens";

@Component({
    selector: "app-globe-map",
    templateUrl: "./globe-map.component.html",
    styleUrl: "./globe-map.component.scss",
    standalone: true,
    imports: [MapComponent],
})
export class GlobeMapComponent {
    private readonly mediaService = inject(MediaQueryService);
    public readonly mapStylesUrl: string = inject(MAPBOX_WITH_BACKGROUND_STYLE);
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

    @Output() zoomEnd: EventEmitter<number> = new EventEmitter<number>();
    @Output() markerClick: EventEmitter<IMapMarker> = new EventEmitter<IMapMarker>();

    public zoom: number = 2.5;

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

    public onMarkerClick(marker: IMapMarker): void {
        this.markerClick.emit(marker);
    }

    public onZoomEnd(zoom: number): void {
        this.zoomEnd.emit(zoom);
    }
}
