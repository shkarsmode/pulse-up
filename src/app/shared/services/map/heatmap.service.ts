import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable, tap } from "rxjs";
import * as h3 from "h3-js";
import { PulseService } from "../api/pulse.service";
import { MapUtils } from "./map-utils.service";
import { AppConstants } from "../../constants";
import { IH3Votes } from "../../interfaces/map/h3-votes.interface";
import { IHeatmapData } from "../../interfaces/map/heatmap-data.interface";
import { IHeatmapWeight } from "../../interfaces/map/heatmap-weight.interface";

@Injectable({
    providedIn: "root",
})
export class HeatmapService {
    private pulseService = inject(PulseService);
    private weightsSubject = new BehaviorSubject<IHeatmapWeight[]>([]);

    public weights$ = this.weightsSubject.asObservable();

    public getHeatmapData(mapboxMap: mapboxgl.Map, topicId?: number): Observable<IHeatmapData> {
        const resolution = MapUtils.getResolutionLevel({
            map: mapboxMap,
            resolutionLevelsByZoom: AppConstants.ZOOM_RESOLUTION_MAP,
        });

        const { ne, sw } = MapUtils.getMapBounds({ map: mapboxMap });

        return this.pulseService
            .getMapVotes(ne.lat, ne.lng, sw.lat, sw.lng, resolution > 9 ? 7 : resolution, topicId)
            .pipe(
                map((heatmapData) => {
                    let votesByH3Index: IH3Votes = {};
                    if (resolution === 0) {
                        Object.entries(heatmapData).forEach(([h3Index, numberOfVotes]) => {
                            const parsedIndex = h3Index.split(":").at(-1);
                            if (parsedIndex) {
                                votesByH3Index[parsedIndex] = numberOfVotes;
                            }
                        });
                    } else {
                        votesByH3Index = heatmapData;
                    }
                    return votesByH3Index;
                }),
                map((votesByH3Index) => {
                    return Object.keys(votesByH3Index).map((key) => ({
                        coords: h3.h3ToGeo(key),
                        value: votesByH3Index[key],
                        h3Index: key,
                    }));
                }),
                tap((data) => this.updateWeights(data)),
            );
    }

    public getHeatmapGeoJson(data: IHeatmapData): GeoJSON.FeatureCollection {
        const heatmapFeatures = data.map(
            ({ coords, value }) =>
                ({
                    type: "Feature",
                    properties: {
                        value: value,
                    },
                    geometry: {
                        type: "Point",
                        coordinates: [coords[1], coords[0]],
                    },
                }) as GeoJSON.Feature,
        );

        const heatmapGeoJSON: GeoJSON.FeatureCollection = {
            type: "FeatureCollection",
            features: heatmapFeatures,
        };

        return heatmapGeoJSON;
    }

    public clearWeights(): void {
        this.weightsSubject.next([]);
    }

    private updateWeights(data: IHeatmapData) {
        this.weightsSubject.next(
            data.map(({ coords, h3Index, value }) => ({
                h3Index,
                value,
                lat: coords[0],
                lng: coords[1],
            })),
        );
    }
}
