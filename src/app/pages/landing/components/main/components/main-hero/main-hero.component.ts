import { Component, effect, inject } from "@angular/core";
import { Router } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { PlatformService } from "@/app/shared/services/core/platform.service";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { MediaQueryService } from "@/app/shared/services/core/media-query.service";
import { SettingsService } from "@/app/shared/services/api/settings.service";

@Component({
    selector: "app-main-hero",
    templateUrl: "./main-hero.component.html",
    styleUrls: ["./main-hero.component.scss"],
})
export class MainHeroComponent {
    private map: mapboxgl.Map | null = null;
    private router: Router = inject(Router);
    private mediaService: MediaQueryService = inject(MediaQueryService);
    private settingsService: SettingsService = inject(SettingsService);
    private isMobile = toSignal(this.mediaService.mediaQuery("max", "SM"));
    private isXSMobile = toSignal(this.mediaService.mediaQuery("max", "XS"));
    private isXXSMobile = toSignal(this.mediaService.mediaQuery("max", "XXS"));
    private isXXXSMobile = toSignal(this.mediaService.mediaQuery("max", "XXXS"));
    // At low zooms, complete a revolution every two minutes.
    private secondsPerRevolution = 120;
    // Above zoom level 5, do not rotate.
    private maxSpinZoom = 5;
    // Rotate at intermediate speeds between zoom levels 3 and 5.
    private slowSpinZoom = 3;
    private userInteracting = false;
    private spinEnabled = true;

    public AppRoutes = AppRoutes;
    public zoom = 1.5;

    private readonly platformService: PlatformService = inject(PlatformService);

    constructor() {
        effect(() => {
            this.zoom = this.isXXXSMobile()
                ? 0.45
                : this.isXXSMobile()
                ? 0.55
                : this.isXSMobile()
                ? 0.8
                : this.isMobile()
                ? 1
                : 1.5;
        });
    }

    public onMapLoaded(map: mapboxgl.Map) {
        this.map = map;
        this.spinGlobe();

        // Pause spinning on user interaction (mouse or touch)
        const onUserInteractionStart = () => {
            this.userInteracting = true;
        };

        const onUserInteractionEnd = () => {
            this.userInteracting = false;
            this.spinGlobe();
        };

        this.map.on("mousedown", onUserInteractionStart);
        this.map.on("touchstart", onUserInteractionStart);

        this.map.on("mouseup", onUserInteractionEnd);
        this.map.on("touchend", onUserInteractionEnd);

        this.map.on("dragend", onUserInteractionEnd);
        this.map.on("pitchend", onUserInteractionEnd);
        this.map.on("rotateend", onUserInteractionEnd);

        this.map.on("moveend", () => {
            this.spinGlobe();
        });

        this.map.on("click", () => {
            this.navigateToMapPage();
        });
    }

    public onMarkerClick() {
        this.navigateToMapPage();
    }

    public openStore(): void {
        if (this.platformService.value == "iOS") window.open(this.settingsService.appStoreUrl);
        else window.open(this.settingsService.googlePlayUrl);
    }

    private navigateToMapPage() {
        this.router.navigateByUrl(`/${this.AppRoutes.Landing.MAP}`);
    }

    private spinGlobe() {
        if (!this.map) return;
        const zoom = this.map.getZoom();
        if (this.spinEnabled && !this.userInteracting && zoom < this.maxSpinZoom) {
            let distancePerSecond = 360 / this.secondsPerRevolution;
            if (zoom > this.slowSpinZoom) {
                // Slow spinning at higher zooms
                const zoomDif = (this.maxSpinZoom - zoom) / (this.maxSpinZoom - this.slowSpinZoom);
                distancePerSecond *= zoomDif;
            }
            const center = this.map.getCenter();
            center.lng -= distancePerSecond;
            // Smoothly animate the map over one second.
            // When this animation is complete, it calls a 'moveend' event.
            this.map.easeTo({ center, duration: 500, easing: (n) => n });
        }
    }
}
