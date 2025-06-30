import { Component, inject, Input, OnInit } from "@angular/core";
import { first, tap } from "rxjs";
import * as h3 from "h3-js";
import { MapUtils } from "@/app/features/landing/services/map-utils.service";
import { AppConstants } from "@/app/shared/constants";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { MapPainter } from "@/app/shared/helpers/map-painter";
import { throttle } from "@/app/shared/helpers/throttle";

@Component({
    selector: "app-map-heatmap-layer",
    template: "",
    styles: [``],
    standalone: true,
    imports: [],
})
export class MapHeatmapLayerComponent implements OnInit {
    private readonly pulseService = inject(PulseService);

    @Input() map: mapboxgl.Map;
    @Input() topicId?: number;

    private readonly sourceId = "vibes";
    readonly intensity: number = 0.1;
    painter: MapPainter;
    heatmapDataPointsCount: number = 0;

    ngOnInit() {
        this.painter = new MapPainter({
            map: this.map,
            sourceId: "hexagons",
        });
        this.addHeatmapToMap();
        this.updateHeatmap();
        this.map.on("load", this.updateHeatmap);
        this.map.on("zoomend", this.updateHeatmap);
        this.map.on("move", throttle(this.updateHeatmap, 500));
    }

    private updateHeatmap = (): void => {
        const resolution = MapUtils.getResolutionLevel({
            map: this.map,
            resolutionLevelsByZoom: AppConstants.ZOOM_RESOLUTION_MAP,
        });

        const { ne, sw } = MapUtils.getMapBounds({ map: this.map });

        this.pulseService
            .getMapVotes(
                ne.lat,
                ne.lng,
                sw.lat,
                sw.lng,
                resolution > 9 ? 7 : resolution,
                this.topicId,
            )
            .pipe(
                first(),
                tap((heatmap) => {
                    this.heatmapDataPointsCount = Object.keys(heatmap).length;
                }),
            )
            .subscribe((heatmapData) => {
                const resolution = MapUtils.getResolutionLevel({
                    map: this.map,
                    resolutionLevelsByZoom: AppConstants.ZOOM_RESOLUTION_MAP,
                });
                let heatmap: { [key: string]: number } = {};
                if (resolution === 0) {
                    Object.entries(heatmapData).forEach(([h3Index, numberOfVotes]) => {
                        const parsedIndex = h3Index.split(":").at(-1);
                        if (parsedIndex) {
                            heatmap[parsedIndex] = numberOfVotes;
                        }
                    });
                } else {
                    heatmap = heatmapData;
                }

                const updatedHeatmapData = Object.keys(heatmap).map((key: string) => ({
                    coords: h3.h3ToGeo(key),
                    value: heatmap[key],
                    h3Index: key,
                }));

                const heatmapFeatures = updatedHeatmapData.map(({ coords, value }) => ({
                    type: "Feature",
                    properties: {
                        value: value,
                    },
                    geometry: {
                        type: "Point",
                        coordinates: [coords[1], coords[0]],
                    },
                }));

                const heatmapGeoJSON = {
                    type: "FeatureCollection",
                    features: heatmapFeatures,
                };

                this.paintIntensity();
                this.paintRadius();
                this.updateHeatmapData(heatmapGeoJSON);
            });
    };

    private paintIntensity() {
        MapUtils.updatePaintProperty({
            map: this.map,
            layerId: "vibes-heat",
            property: "heatmap-intensity",
            value: this.intensity,
        });
    }

    private paintRadius() {
        const heatmapRadius = this.calculateHeatmapRadius(this.map.getZoom() || 0);
        MapUtils.updatePaintProperty({
            map: this.map,
            layerId: "vibes-heat",
            property: "heatmap-radius",
            value: heatmapRadius,
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

    private updateHeatmapData(data: any): void {
        MapUtils.setSourceData({
            map: this.map,
            sourceId: this.sourceId,
            data,
        });
    }

    private addHeatmapToMap(): void {
        MapUtils.addGeoJsonSource({
            map: this.map,
            id: this.sourceId,
            data: {
                type: "FeatureCollection",
                features: [],
            },
        });
        MapUtils.addHeatmapLayer({
            map: this.map,
            layerId: "vibes-heat",
            sourceId: this.sourceId,
            data: AppConstants.HEATMAP_STYLES,
        });
    }
}
