import { ITopic } from "@/app/shared/interfaces";
import { IMapMarker, IMapMarkerAnimated } from "@/app/shared/interfaces/map-marker.interface";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { inject, Injectable } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import * as h3 from "h3-js";
import { debounceTime, first, Subject, tap } from "rxjs";
import { TopCellTopicsByH3Index } from "../helpers/interfaces/h3-pulses.interface";

@Injectable({
    providedIn: "root",
})
export class MapMarkersService {
    private readonly pulseService: PulseService = inject(PulseService);

    private readonly markerHover$ = new Subject<IMapMarker>();
    public markers: IMapMarkerAnimated[] = [];
    public tooltipData: (ITopic & { markerId: number }) | null = null;
    private pulseCache = new Map<number, ITopic>();

    constructor() {
        this.markerHover$.pipe(debounceTime(300), takeUntilDestroyed()).subscribe((marker) => {
            this.tooltipData = null;
            const cached = this.pulseCache.get(marker.topicId);
            if (cached) {
                this.tooltipData = {
                    ...cached,
                    markerId: marker.id,
                }
                return;
            }
            this.pulseService
                .getById(marker.topicId)
                .pipe(
                    first(),
                    tap((pulse) => this.pulseCache.set(pulse.id, pulse)), 
                )
                .subscribe((pulse) => {
                    this.tooltipData = {
                        ...pulse,
                        markerId: marker.id,
                    };
                });
        });
    }

    public updateMarkers(data: TopCellTopicsByH3Index): void {
        this.markers = [];
        Object.keys(data).forEach((h3Index: any, index: number) => {
            const [lat, lng] = h3.h3ToGeo(h3Index);
            this.markers.push({
                id: index,
                lng,
                lat,
                icon: data[h3Index].icon,
                h3Index,
                topicId: data[h3Index].topicId,
                delay: this.randomInteger(100, 2000),
            });
        });
        console.log({markers: this.markers});
    }

    public hideTooltip(): void {
        this.tooltipData = null;
    }

    public handleMarkerHover(marker: IMapMarker): void {
        this.markerHover$.next(marker);
    }

    private randomInteger(min: number, max: number) {
        let rand = min + Math.random() * (max + 1 - min);
        return Math.floor(rand);
    }
}
