import { H3Service } from '@/app/features/landing/services/h3.service';
import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, from, map, Observable, switchMap, tap } from "rxjs";
import { AppConstants } from "../../constants";
import { IH3Votes } from "../../interfaces/map/h3-votes.interface";
import { IHeatmapData } from "../../interfaces/map/heatmap-data.interface";
import { IHeatmapWeight } from "../../interfaces/map/heatmap-weight.interface";
import { PulseService } from "../api/pulse.service";
import { MapUtils } from "./map-utils.service";

@Injectable({
    providedIn: "root",
})
export class HeatmapService {
    private pulseService = inject(PulseService);
    private weightsSubject = new BehaviorSubject<IHeatmapWeight[]>([]);
    private h3Service = inject(H3Service);

    public weights$ = this.weightsSubject.asObservable();

    public getHeatmapData(mapboxMap: mapboxgl.Map, topicId?: number): Observable<IHeatmapData> {
        const resolution = MapUtils.getResolutionLevel({
            map: mapboxMap,
            resolutionLevelsByZoom: AppConstants.ZOOM_RESOLUTION_MAP,
        });

        const { ne, sw } = MapUtils.getMapBounds({ map: mapboxMap });

        return this.pulseService
            .getMapVotes(
                ne.lat,
                ne.lng,
                sw.lat,
                sw.lng,
                resolution > 9 ? 7 : resolution,
                topicId
            )
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
                switchMap((votesByH3Index) =>
                    from(this.mapVotesToHeatmapData(votesByH3Index))
                ),
                tap((data) => this.updateWeights(data))
            );
    }

    private async mapVotesToHeatmapData(
        votesByH3Index: IH3Votes
    ): Promise<IHeatmapData> {
        const result: IHeatmapData = [];
    
        for (const key of Object.keys(votesByH3Index)) {
            const coords = await this.h3Service.h3ToGeo(key);
            if (!coords) continue;
    
            result.push({
                coords,
                value: votesByH3Index[key],
                h3Index: key
            });
        }
    
        return result;
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

    public getHeatmapDataForBounds(
        NElatitude: number,
        NElongitude: number,
        SWlatitude: number,
        SWlongitude: number,
        resolution = 1,
        topicId?: number,
    ): Observable<IHeatmapData> {
        return this.pulseService
            .getMapVotes(NElatitude, NElongitude, SWlatitude, SWlongitude, resolution, topicId)
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
                switchMap((votesByH3Index) => from(this.mapVotesToHeatmapData(votesByH3Index))),
                tap((data) => this.updateWeights(data)),
            );
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
