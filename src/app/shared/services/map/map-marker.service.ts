import { IH3Pulses } from "@/app/features/landing/interfaces/h3-pulses.interface";
import { H3Service } from '@/app/features/landing/services/h3.service';
import { ITopic } from "@/app/shared/interfaces";
import { IMapMarker, IMapMarkerAnimated } from "@/app/shared/interfaces/map/map-marker.interface";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { inject, Injectable } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
    BehaviorSubject,
    debounceTime,
    EMPTY,
    first,
    Subject,
    switchMap,
    tap
} from "rxjs";
import { ICategory } from "../../interfaces/category.interface";

interface TooltipData extends ITopic {
    markerId: number;
}

@Injectable({
    providedIn: "root",
})
export class MapMarkersService {
    private readonly pulseService: PulseService = inject(PulseService);
    private readonly h3Service: H3Service = inject(H3Service);

    private readonly markerHover$ = new Subject<IMapMarker>();
    private markers = new BehaviorSubject<IMapMarkerAnimated[]>([]);
    private tooltipData = new BehaviorSubject<TooltipData | null>(null);
    private categorySubject = new BehaviorSubject<ICategory | null>(null);
    private pulseCache = new Map<number, ITopic>();

    public markers$ = this.markers.asObservable();
    public tooltipData$ = this.tooltipData.asObservable();
    public category$ = this.categorySubject.asObservable();

    public get tooltipDataValue(): TooltipData | null {
        return this.tooltipData.getValue();
    }

    public set category(category: ICategory | null) {
        this.categorySubject.next(category);
    }

    constructor() {
        this.markerHover$
            .pipe(
                debounceTime(300),
                takeUntilDestroyed(),
                switchMap((marker) => {
                    this.tooltipData.next(null);

                    const cached = this.pulseCache.get(marker.topicId);
                    if (cached) {
                        this.tooltipData.next({
                            ...cached,
                            markerId: marker.id,
                        });

                        // no HTTP call needed, просто завершаем цепочку
                        return EMPTY;
                    }

                    return this.pulseService.getById(marker.topicId).pipe(
                        first(),
                        tap((pulse) => this.pulseCache.set(pulse.id, pulse)),
                        tap((pulse) => {
                            this.tooltipData.next({
                                ...pulse,
                                markerId: marker.id,
                            });
                        })
                    );
                })
            )
            .subscribe();
    }

    public updateMarkers(data: IH3Pulses): void {
        const entries = Object.entries(data);

        Promise.all(
            entries.map(async ([h3Index, item], index) => {
                const coords = await this.h3Service.h3ToGeo(h3Index);

                if (!coords) {
                    // SSR или ошибка — просто пропускаем маркер
                    return null;
                }

                const [lat, lng] = coords;

                const marker: IMapMarkerAnimated = {
                    id: index,
                    lng,
                    lat,
                    icon: item.icon,
                    h3Index,
                    topicId: item.topicId,
                    delay: this.randomInteger(100, 2000),
                };

                return marker;
            })
        ).then((markers) => {
            this.markers.next(
                markers.filter((marker): marker is IMapMarkerAnimated => marker !== null)
            );
        });
    }

    public clearMarkers(): void {
        this.markers.next([]);
    }

    public hideTooltip(): void {
        this.tooltipData.next(null);
    }

    public handleMarkerHover(marker: IMapMarker): void {
        this.markerHover$.next(marker);
    }

    private randomInteger(min: number, max: number): number {
        const rand = min + Math.random() * (max + 1 - min);
        return Math.floor(rand);
    }
}
