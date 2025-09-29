import { Component, computed, DestroyRef, effect, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { catchError, throwError } from "rxjs";
import mapboxgl from "mapbox-gl";
import { ITopic } from "@/app/shared/interfaces";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { MediaQueryService } from "@/app/shared/services/core/media-query.service";
import { ResponsiveMapConfig } from "@/app/shared/interfaces/responsive-map-config.interface";
import { MapComponent } from "@/app/shared/components/map/map.component";
import { FadeInDirective } from "@/app/shared/animations/fade-in.directive";
import { FormatNumberPipe } from "@/app/shared/pipes/format-number.pipe";
import { LoadImgPathDirective } from "@/app/shared/directives/load-img-path/load-img-path.directive";
import { MapHeatmapLayerComponent } from "@/app/shared/components/map/map-heatmap-layer/map-heatmap-layer.component";
import { HeaderComponent } from "@/app/shared/components/header/header.component";
import { AppConstants } from "@/app/shared/constants";
import { IpLocationService } from "@/app/shared/services/core/ip-location.service";

@Component({
    selector: "app-pulse-heatmap-page",
    templateUrl: "./pulse-heatmap-page.component.html",
    styleUrl: "./pulse-heatmap-page.component.scss",
    standalone: true,
    imports: [
        CommonModule,
        MapComponent,
        FadeInDirective,
        FormatNumberPipe,
        LoadImgPathDirective,
        MapHeatmapLayerComponent,
        HeaderComponent,
    ],
})
export class PulseHeatmapPageComponent implements OnInit {
    private destroyRef = inject(DestroyRef);
    private router: Router = inject(Router);
    private route: ActivatedRoute = inject(ActivatedRoute);
    private pulseService: PulseService = inject(PulseService);
    private ipLocationService = inject(IpLocationService);
    private mediaService = inject(MediaQueryService);

    private isMobile = toSignal(this.mediaService.mediaQuery("max", "SM"));
    private isSmallMobile = toSignal(this.mediaService.mediaQuery("max", "XS"));
    private coordinates = toSignal(this.ipLocationService.countryCoordinates$);
    private readonly configMap: Record<"xs" | "sm" | "default", ResponsiveMapConfig> = {
        xs: {
            zoom: [1.9],
            minZoom: 1.9,
            maxBounds: [
                [-150, -85],
                [164, 85],
            ],
        },
        sm: {
            zoom: [2],
            minZoom: 2,
            maxBounds: [
                [-150, -85],
                [164, 85],
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

    public map: mapboxgl.Map | null = null;
    public pulse: ITopic;
    public isLoading = true;
    public zoom: [number] = this.configMap.default.zoom;
    public minZoom: number = this.configMap.default.minZoom;
    public maxBounds: mapboxgl.LngLatBoundsLike = this.configMap.default.maxBounds;
    public countryCoordinates = computed(() => {
        const coordinates = this.coordinates();
        return coordinates
            ? [coordinates.longitude, coordinates.latitude] as [number, number]
            : AppConstants.MAP_CENTER_COORDINATES;
    });

    constructor() {
        effect(() => {
            const config = this.isSmallMobile()
                ? this.configMap.xs
                : this.isMobile()
                  ? this.configMap.sm
                  : this.configMap.default;

            this.zoom = config.zoom;
            this.minZoom = config.minZoom;
            this.maxBounds = config.maxBounds;
        });
    }

    public ngOnInit(): void {
        this.initPulseUrlIdListener();
    }

    public onMapLoaded(map: mapboxgl.Map): void {
        this.map = map;
    }

    private initPulseUrlIdListener(): void {
        this.route.paramMap
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(this.handlePulseUrlIdListener.bind(this));
    }

    private handlePulseUrlIdListener(data: ParamMap): void {
        const id = data.get("id")!;

        this.getPulseById(id);
    }

    private getPulseById(id: string | number): void {
        this.pulseService
            .getById(id)
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                catchError((error: unknown) => {
                    this.router.navigateByUrl("/" + AppRoutes.Community.INVALID_LINK);
                    return throwError(() => error);
                }),
            )
            .subscribe((pulse) => {
                this.pulse = pulse;
                this.isLoading = false;
            });
    }
}
