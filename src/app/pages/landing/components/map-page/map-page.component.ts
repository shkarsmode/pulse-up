import { Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MediaQueryService } from '@app/shared/services/core/media-query.service';

interface MapConfig {
    zoom: [number];
    minZoom: number;
    maxBounds: mapboxgl.LngLatBoundsLike;
}

@Component({
    selector: 'app-map-page',
    templateUrl: './map-page.component.html',
    styleUrl: './map-page.component.scss',
})
export class MapPageComponent {
    private mediaService = inject(MediaQueryService);
    private isMobile = toSignal(this.mediaService.mediaQuery('max', 'sm'));
    private isLaptop = toSignal(this.mediaService.mediaQuery('max', 'xl'));
    private readonly configMap: Record<
        'mobile' | 'laptop' | 'default',
        MapConfig
    > = {
        mobile: {
            zoom: [2],
            minZoom: 2,
            maxBounds: [
                [-150, -85],
                [164, 85],
            ],
        },
        laptop: {
            zoom: [2.8],
            minZoom: 2.8,
            maxBounds: [
                [-164, -85],
                [150, 85],
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

    public zoom: [number] = this.configMap.default.zoom;
    public minZoom: number = this.configMap.default.minZoom;
    public maxBounds: mapboxgl.LngLatBoundsLike = this.configMap.default.maxBounds;
    public center: [number, number] = [-100.661, 37.7749];

    constructor() {
        effect(() => {
            const config = this.isMobile()
                ? this.configMap.mobile
                : this.isLaptop()
                ? this.configMap.laptop
                : this.configMap.default;

            this.zoom = config.zoom;
            this.minZoom = config.minZoom;
            this.maxBounds = config.maxBounds;
            this.center = [...this.center];
        });
    }
}
