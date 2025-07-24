import { PulseService } from "@/app/shared/services/api/pulse.service";
import { inject, Injectable } from "@angular/core";
import * as h3 from "h3-js";
import { Observable } from "rxjs";
import { IH3Pulses } from "../helpers/interfaces/h3-pulses.interface";
import { MapBounds } from "../helpers/interfaces/map-bounds.interface";
import { MapUtils } from "./map-utils.service";

@Injectable({
    providedIn: "root",
})
export class H3LayerService {
    private readonly pulseService: PulseService = inject(PulseService);
    private readonly sourceId = "h3-polygons";

    public getH3Pulses({
        bounds,
        resolution,
        pulseId,
    }: {
        bounds: MapBounds,
        resolution: number,
        pulseId?: number,
    }): Observable<IH3Pulses> {
        const {ne, sw} = bounds;
        return this.pulseService.getH3PulsesForMap({
            NElatitude: ne.lat,
            NElongitude: ne.lng,
            SWlatitude: sw.lat,
            SWlongitude: sw.lng,
            resolution,
        });
    }

    public updateH3PolygonSource({ map, data }: { map: mapboxgl.Map; data: IH3Pulses }) {
        const geojson = this.convertH3ToGeoJSON(data);
        MapUtils.setSourceData({
            map,
            sourceId: this.sourceId,
            data: geojson,
        });
    }

    public addH3PolygonsToMap({map, h3Indexes, sourceId}: {map: mapboxgl.Map, h3Indexes: string[], sourceId?: string}): void {
        const hexagons = h3Indexes.filter((h3Index) => !MapUtils.isHexagonCrossesAntimeridian(h3Index));
        const hexagonFeatures = hexagons.map((hex) => this.h3ToPolygonFeature(hex));
        MapUtils.setSourceData({
            map,
            sourceId: sourceId || this.sourceId,
            data: {
                type: "FeatureCollection",
                features: hexagonFeatures,
            },
        });
    }

    private convertH3ToGeoJSON(data: IH3Pulses) {
        const features = Object.keys(data).map((h3Index) => {
            const polygon = h3.h3ToGeoBoundary(h3Index, true);
            return {
                type: "Feature",
                geometry: {
                    type: "Polygon",
                    coordinates: [polygon],
                },
                properties: {
                    votes: data[h3Index].votes,
                    // users: data[h3Index].users,
                    icon: data[h3Index].icon,
                    h3Index,
                },
            };
        });

        return {
            type: "FeatureCollection",
            features,
        };
    }

    private h3ToPolygonFeature(hex: string): GeoJSON.Feature<GeoJSON.Polygon> {
        const boundary = h3.h3ToGeoBoundary(hex, true);
        return {
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [boundary],
            },
            properties: {},
        };
    }
}
