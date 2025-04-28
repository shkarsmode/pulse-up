import { Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AppRoutes } from '@/app/shared/enums/app-routes.enum';
import { ResponsiveMapConfig } from '@/app/shared/interfaces/responsive-map-config.interface';
import { MediaQueryService } from '@/app/shared/services/core/media-query.service';

@Component({
    selector: 'app-main-map',
    templateUrl: './main-map.component.html',
    styleUrl: './main-map.component.scss'
})
export class MainMapComponent {
    public AppRoutes = AppRoutes
    private mediaService = inject(MediaQueryService);
    private isMobile = toSignal(this.mediaService.mediaQuery('max', 'SM'));
    private isSmallMobile = toSignal(this.mediaService.mediaQuery('max', 'XS'));
    private readonly configMap: Record<'xs' | 'sm' | "default", ResponsiveMapConfig> = {
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
            zoom: [2.8],
            minZoom: 2.8,
            maxBounds: [
                [-164, -85],
                [163, 85],
            ],
        },
    };
    public routes = AppRoutes;
    public zoom: [number] = this.configMap.default.zoom;
    public minZoom: number = this.configMap.default.minZoom;
    public maxBounds: mapboxgl.LngLatBoundsLike = this.configMap.default.maxBounds;

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
}
