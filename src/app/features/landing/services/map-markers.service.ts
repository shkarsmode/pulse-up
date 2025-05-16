import { inject, Injectable } from "@angular/core";
import * as h3 from "h3-js";
import { debounceTime, Subject } from "rxjs";
import { IMapMarker, IMapMarkerAnimated } from "@/app/shared/interfaces/map-marker.interface";
import { IH3Pulses } from "../interfaces/h3-pulses.interface";
import { IPulse } from "@/app/shared/interfaces";
import { PulseService } from "@/app/shared/services/api/pulse.service";

@Injectable({
    providedIn: "root",
})
export class MapMarkersService {
    private readonly pulseService: PulseService = inject(PulseService);

    public markers: IMapMarkerAnimated[] = [];
    public tooltipData: IPulse | null = null;
    public readonly markerHover$ = new Subject<IMapMarker>();

    constructor() {
        this.markerHover$.pipe(debounceTime(300)).subscribe((marker) => {
            this.tooltipData = null;
            this.pulseService.getById(marker.topicId).subscribe((pulse) => {
                this.tooltipData = pulse;
            });
        });
    }

    public updateMarkers(data: IH3Pulses): void {
        this.markers = [];
        Object.keys(data).forEach((h3Index: any) => {
            const [lat, lng] = h3.h3ToGeo(h3Index);
            this.markers.push({
                lng,
                lat,
                icon: data[h3Index].icon,
                h3Index,
                topicId: data[h3Index].topicId.toString(),
                delay: this.randomInteger(100, 2000),
            });
        });
    }

    private randomInteger(min: number, max: number) {
        let rand = min + Math.random() * (max + 1 - min);
        return Math.floor(rand);
    }
}
