import { inject, Injectable } from "@angular/core";
import * as h3 from "h3-js";
import { BehaviorSubject, debounceTime, first, Subject, tap } from "rxjs";
import { IMapMarker, IMapMarkerAnimated } from "@/app/shared/interfaces/map-marker.interface";
import { ITopic } from "@/app/shared/interfaces";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { IH3Pulses } from "@/app/features/landing/helpers/interfaces/h3-pulses.interface";
import { ICategory } from "../../interfaces/category.interface";

interface TooltipData extends ITopic {
    markerId: number;
}

@Injectable({
    providedIn: "root",
})
export class MapMarkersService {
    private readonly pulseService: PulseService = inject(PulseService);

    private readonly markerHover$ = new Subject<IMapMarker>();
    private markers = new BehaviorSubject<IMapMarkerAnimated[]>([]);
    private tooltipData = new BehaviorSubject<TooltipData | null>(null);
    private categorySubject = new BehaviorSubject<ICategory | null>(null);
    private pulseCache = new Map<number, ITopic>();

    public markers$ = this.markers.asObservable();
    public tooltipData$ = this.tooltipData.asObservable();
    public category$ = this.categorySubject.asObservable();
    public get tooltipDataValue() {
        return this.tooltipData.getValue();
    }
    public set category(category: ICategory | null) {
        this.categorySubject.next(category);
    }

    constructor() {
        this.markerHover$.pipe(debounceTime(300), takeUntilDestroyed()).subscribe((marker) => {
            this.tooltipData.next(null);
            const cached = this.pulseCache.get(marker.topicId);
            if (cached) {
                this.tooltipData.next({
                    ...cached,
                    markerId: marker.id,
                });
                return;
            }
            this.pulseService
                .getById(marker.topicId)
                .pipe(
                    first(),
                    tap((pulse) => this.pulseCache.set(pulse.id, pulse)),
                )
                .subscribe((pulse) => {
                    this.tooltipData.next({
                        ...pulse,
                        markerId: marker.id,
                    });
                });
        });
    }

    public updateMarkers(data: IH3Pulses): void {
        const markers: IMapMarkerAnimated[] = [];
        Object.keys(data).forEach((h3Index: any, index: number) => {
            const [lat, lng] = h3.h3ToGeo(h3Index);
            markers.push({
                id: index,
                lng,
                lat,
                icon: data[h3Index].icon,
                h3Index,
                topicId: data[h3Index].topicId,
                delay: this.randomInteger(100, 2000),
            });
        });
        this.markers.next(markers);
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

    private randomInteger(min: number, max: number) {
        let rand = min + Math.random() * (max + 1 - min);
        return Math.floor(rand);
    }
}
