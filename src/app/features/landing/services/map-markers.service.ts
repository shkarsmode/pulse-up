import { inject, Injectable } from "@angular/core";
import * as h3 from "h3-js";
import { debounceTime, first, Subject } from "rxjs";
import { IMapMarker, IMapMarkerAnimated } from "@/app/shared/interfaces/map-marker.interface";
import { IH3Pulses } from "../interfaces/h3-pulses.interface";
import { ITopic } from "@/app/shared/interfaces";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Injectable({
    providedIn: "root",
})
export class MapMarkersService {
    private readonly pulseService: PulseService = inject(PulseService);

    public markers: IMapMarkerAnimated[] = [];
    public tooltipData: (ITopic & { markerId: number }) | null = null;
    public readonly markerHover$ = new Subject<IMapMarker>();

    constructor() {
        this.markerHover$.pipe(debounceTime(300), takeUntilDestroyed()).subscribe((marker) => {
            this.tooltipData = null;
            this.pulseService
                .getById(marker.topicId)
                .pipe(first())
                .subscribe((pulse) => {
                    this.tooltipData = {
                        ...pulse,
                        markerId: marker.id,
                    };
                });
        });
    }

    public updateMarkers(data: IH3Pulses): void {
        this.markers = [];
        Object.keys(data).forEach((h3Index: any, index: number) => {
            const [lat, lng] = h3.h3ToGeo(h3Index);
            this.markers.push({
                id: index,
                lng,
                lat,
                icon: data[h3Index].icon,
                h3Index,
                topicId: data[h3Index].topicId.toString(),
                delay: this.randomInteger(100, 2000),
            });
        });
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
