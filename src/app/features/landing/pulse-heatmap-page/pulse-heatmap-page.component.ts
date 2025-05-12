import { Component, effect, inject } from '@angular/core';
import { IPulse } from '../../../shared/interfaces';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { PulseService } from '../../../shared/services/api/pulse.service';
import { catchError, first, of, take } from 'rxjs';
import { AppRoutes } from '../../../shared/enums/app-routes.enum';
import { MediaQueryService } from '@/app/shared/services/core/media-query.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ResponsiveMapConfig } from '@/app/shared/interfaces/responsive-map-config.interface';

@Component({
    selector: 'app-pulse-heatmap-page',
    templateUrl: './pulse-heatmap-page.component.html',
    styleUrl: './pulse-heatmap-page.component.scss',
})
export class PulseHeatmapPageComponent {
    private readonly router: Router = inject(Router);
    private readonly route: ActivatedRoute = inject(ActivatedRoute);
    private readonly pulseService: PulseService = inject(PulseService);
    private mediaService = inject(MediaQueryService);
    private isMobile = toSignal(this.mediaService.mediaQuery('max', 'SM'));
    private isSmallMobile = toSignal(this.mediaService.mediaQuery('max', 'XS'));
    private readonly configMap: Record<
        'xs' | 'sm' | 'default',
        ResponsiveMapConfig
    > = {
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

    public pulse: IPulse;
    public isLoading: boolean = true;
    public zoom: [number] = this.configMap.default.zoom;
    public minZoom: number = this.configMap.default.minZoom;
    public maxBounds: mapboxgl.LngLatBoundsLike =
        this.configMap.default.maxBounds;
        public center: [number, number] = [-100.661, 37.7749];

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
            this.center = [...this.center];
        });
    }

    public ngOnInit(): void {
        this.initPulseUrlIdListener();
    }

    private initPulseUrlIdListener(): void {
        this.route.paramMap
            .pipe(take(1))
            .subscribe(this.handlePulseUrlIdListener.bind(this));
    }

    private handlePulseUrlIdListener(data: ParamMap): void {
        const id = data.get('id')!;

        this.getPulseById(id);
    }

    private getPulseById(id: string | number): void {
        this.pulseService
            .getById(id)
            .pipe(
                first(),
                catchError((error) => {
                    this.router.navigateByUrl(
                        '/' + AppRoutes.Community.INVALID_LINK
                    );
                    return of(error);
                })
            )
            .subscribe((pulse) => {
                this.pulse = pulse;
                this.isLoading = false;
            });
    }

    public backToPulsePage(): void {
        this.router.navigateByUrl(`topic/${this.pulse.id}`);
    }
}
