import { inject, Injectable } from "@angular/core";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { MapUtils } from "./map-utils.service";
import mapboxgl from "mapbox-gl";
import { IHeatmapData } from "../interfaces/heatmapData.interface";

@Injectable({
    providedIn: "root",
})
export class HeatmapLayerService {
    private readonly pulseService: PulseService = inject(PulseService);
    private readonly sourceId = "vibes";

    public intensity: number = 0.1;
    public weights: any = [];
    public heatmapStyles: any = {
        "heatmap-intensity": 0.35,
        "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],

            0,
            "rgba(141,201,255,0)",
            0.01,
            "rgba(141,201,255,0.1)",
            0.02,
            "rgba(141,201,255,0.4)",
            0.03,
            "rgba(141,201,255,0.7)",
            0.04,
            "rgba(141,201,255,0.9)",

            0.05,
            "rgb(141,201,255)",
            0.06,
            "rgb(140,204,249)",
            0.07,
            "rgb(139,207,243)",
            0.08,
            "rgb(138,210,237)",
            0.09,
            "rgb(137,213,233)",

            0.1,
            "rgb(135,216,225)",
            0.11,
            "rgb(135,219,220)",
            0.12,
            "rgb(134,222,216)",
            0.13,
            "rgb(133,224,212)",
            0.14,
            "rgb(132,226,208)",

            0.15,
            "rgb(131,228,204)",
            0.16,
            "rgb(131,230,200)",
            0.17,
            "rgb(130,232,196)",
            0.18,
            "rgb(130,234,192)",
            0.19,
            "rgb(129,236,188)",

            0.2,
            "rgb(128,238,185)",
            0.21,
            "rgb(128,240,181)",
            0.22,
            "rgb(127,242,177)",
            0.23,
            "rgb(126,244,172)",
            0.24,
            "rgb(125,247,168)",

            0.25,
            "rgb(124,250,163)",
            0.26,
            "rgb(126,251,158)",
            0.27,
            "rgb(128,252,153)",
            0.28,
            "rgb(130,253,148)",
            0.29,
            "rgb(132,254,144)",

            0.3,
            "rgb(135,255,139)",
            0.31,
            "rgb(140,255,134)",
            0.32,
            "rgb(145,254,129)",
            0.33,
            "rgb(150,254,124)",
            0.34,
            "rgb(156,254,120)",

            0.35,
            "rgb(162,253,116)",
            0.36,
            "rgb(168,253,111)",
            0.37,
            "rgb(174,252,106)",
            0.38,
            "rgb(179,252,101)",
            0.39,
            "rgb(184,252,96)",

            0.4,
            "rgb(189,251,92)",
            0.41,
            "rgb(194,251,88)",
            0.42,
            "rgb(199,251,83)",
            0.43,
            "rgb(204,250,79)",
            0.44,
            "rgb(209,250,75)",

            0.45,
            "rgb(214,249,70)",
            0.46,
            "rgb(219,249,65)",
            0.47,
            "rgb(225,249,61)",
            0.48,
            "rgb(230,249,56)",
            0.49,
            "rgb(235,249,51)",

            0.5,
            "rgb(240,248,47)",
            0.51,
            "rgb(243,247,44)",
            0.52,
            "rgb(246,247,41)",
            0.53,
            "rgb(249,246,38)",
            0.54,
            "rgb(252,245,35)",

            0.55,
            "rgb(255,244,34)",
            0.56,
            "rgb(255,242,34)",
            0.57,
            "rgb(255,240,34)",
            0.58,
            "rgb(255,238,34)",
            0.59,
            "rgb(255,236,34)",

            0.6,
            "rgb(255,235,34)",
            0.61,
            "rgb(255,234,34)",
            0.62,
            "rgb(255,232,34)",
            0.63,
            "rgb(255,231,34)",
            0.64,
            "rgb(255,239,34)",

            0.65,
            "rgb(255,227,35)",
            0.66,
            "rgb(255,226,35)",
            0.67,
            "rgb(255,224,35)",
            0.68,
            "rgb(255,223,35)",
            0.69,
            "rgb(255,222,35)",

            0.7,
            "rgb(255,219,36)",
            0.71,
            "rgb(255,218,36)",
            0.72,
            "rgb(255,217,36)",
            0.73,
            "rgb(255,216,36)",
            0.74,
            "rgb(255,214,36)",

            0.75,
            "rgb(255,212,36)",
            0.76,
            "rgb(255,208,36)",
            0.77,
            "rgb(255,204,35)",
            0.78,
            "rgb(255,200,35)",
            0.79,
            "rgb(255,196,34)",

            0.8,
            "rgb(255,191,34)",
            0.81,
            "rgb(255,184,33)",
            0.82,
            "rgb(255,177,32)",
            0.83,
            "rgb(255,170,31)",
            0.84,
            "rgb(255,163,29)",

            0.85,
            "rgb(254,157,27)",
            0.86,
            "rgb(254,151,26)",
            0.87,
            "rgb(254,145,25)",
            0.88,
            "rgb(254,139,24)",
            0.89,
            "rgb(254,132,23)",

            0.9,
            "rgb(254,127,22)",
            0.91,
            "rgb(254,121,21)",
            0.92,
            "rgb(254,115,20)",
            0.93,
            "rgb(254,109,19)",
            0.94,
            "rgb(254,103,18)",

            0.95,
            "rgb(253,96,16)",
            0.96,
            "rgb(253,88,15)",
            0.97,
            "rgb(253,89,13)",
            0.98,
            "rgb(253,70,12)",
            0.99,
            "rgb(253,61,10)",

            1,
            "rgb(252,53,8)",
        ],
        "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 0, 0.45, 15, 0.45],
    };
    public getHeatmapData({
        map,
        resolution,
        pulseId,
    }: {
        map: mapboxgl.Map;
        resolution: number;
        pulseId?: number;
    }) {
        const { _ne, _sw } = map.getBounds();
        const NELat = _ne.lat;
        const NELng = Math.min(_ne.lng, 180);
        const SWLat = _sw.lat;
        const SWLng = Math.max(_sw.lng, -180);

        return this.pulseService.getMapVotes(
            NELat,
            NELng,
            SWLat,
            SWLng,
            resolution > 9 ? 7 : resolution,
            pulseId,
        );
    }
    public updateHeatmap({ map, data }: { map: mapboxgl.Map; data: any }): void {
        MapUtils.setSourceData({
            map,
            sourceId: this.sourceId,
            data,
        });
    }

    public addHeatmapToMap(map: mapboxgl.Map): void {
        MapUtils.addGeoJsonSource({
            map,
            id: this.sourceId,
            data: {
                type: "FeatureCollection",
                features: [],
            },
        });
        MapUtils.addHeatmapLayer({
            map,
            layerId: "vibes-heat",
            sourceId: this.sourceId,
            data: this.heatmapStyles,
        });
    }

    public paintHeatmapIntensity(map: mapboxgl.Map) {
        MapUtils.updatePaintProperty({
            map,
            layerId: "vibes-heat",
            property: "heatmap-intensity",
            value: this.intensity,
        });
    }

    public paintHeatmapRadius(map: mapboxgl.Map) {
        const heatmapRadius = this.calculateHeatmapRadius(map.getZoom() || 0);
        MapUtils.updatePaintProperty({
            map,
            layerId: "vibes-heat",
            property: "heatmap-radius",
            value: heatmapRadius,
        });
    }

    public paintHeatmapOpacity(map: mapboxgl.Map, opacity: number) {
        MapUtils.updatePaintProperty({
            map,
            layerId: "vibes-heat",
            property: "heatmap-opacity",
            value: opacity,
        });
    }

    public addWeightsToMap(data: IHeatmapData): void {
        this.weights = [];
        data.forEach((item: any) => {
            this.weights.push({
                lat: item.coords[0],
                lng: item.coords[1],
                value: item.value,
                h3Index: item.h3Index,
            });
        });
    }

    private calculateHeatmapRadius(zoom: number) {
        const radiusMap = [
            { zoom: 0, radius: 100 },
            { zoom: 5, radius: 100 },
            { zoom: 10, radius: 120 },
            { zoom: 15, radius: 140 },
            { zoom: 20, radius: 100 },
        ];

        let radius = 100;
        for (const entry of radiusMap) {
            if (zoom >= entry.zoom) {
                radius = entry.radius;
            } else {
                break;
            }
        }

        return radius;
    }
}
