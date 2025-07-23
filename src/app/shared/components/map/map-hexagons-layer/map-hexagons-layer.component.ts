import { Component, inject, Input, OnInit } from "@angular/core";
import { first, Observable, tap } from "rxjs";
import * as h3 from "h3-js";
import { MapPainter } from "@/app/shared/helpers/map-painter";
import { MapUtils } from "@/app/features/landing/services/map-utils.service";
import { AppConstants } from "@/app/shared/constants";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { throttle } from "@/app/shared/helpers/throttle";
import { MapBounds } from "@/app/features/landing/helpers/interfaces/map-bounds.interface";
import { TopCellTopicsByH3Index } from "@/app/features/landing/helpers/interfaces/h3-pulses.interface";

@Component({
    selector: "app-map-hexagons-layer",
    standalone: true,
    imports: [],
    template: "",
    styles: [``],
})
export class MapHexagonsLayerComponent implements OnInit {
    private readonly pulseService = inject(PulseService);

    @Input() map: mapboxgl.Map;
    @Input() topicId?: number;

    painter: MapPainter;

    ngOnInit() {
        this.painter = new MapPainter({
            map: this.map,
            sourceId: "hexagons",
        });
        this.addLayersOnMap(this.painter);
        this.updateHexagons();
        this.map.on("zoomend", () => this.updateHexagons())
        this.map.on("move", throttle(() => this.updateHexagons(), 500));
    }

    private addLayersOnMap(painter: MapPainter): void {
        painter.addGeoJsonSource({
            type: "FeatureCollection",
            features: [],
        });
        painter.addFillLayer({
            layerId: "hexagons-layer-fill",
            data: {
                "fill-color": "#FFFFFF",
                "fill-opacity": 0.3,
            },
        });
        painter.addLineLayer({
            layerId: "hexagons-layer-line",
            data: {
                "line-color": "#FFFFFF",
                "line-width": 2,
                "line-opacity": 0.5,
            },
        });
    }

    private updateHexagons(): void {
        const resolution = MapUtils.getResolutionLevel({
            map: this.map,
            resolutionLevelsByZoom: AppConstants.ZOOM_RESOLUTION_MAP,
        });

        const bounds = MapUtils.getMapBounds({
            map: this.map,
        });

        this.getH3Pulses({ bounds, resolution, pulseId: this.topicId })
            .pipe(
                first(),
                tap((data) => {
                    const geojson = this.convertH3ToGeoJSON(data);
                    this.painter.setSourceData(geojson);
                }),
            )
            .subscribe();
    }

    private getH3Pulses({
        bounds,
        resolution,
        pulseId,
    }: {
        bounds: MapBounds;
        resolution: number;
        pulseId?: number;
    }): Observable<TopCellTopicsByH3Index> {
        const { ne, sw } = bounds;
        return this.pulseService.getH3PulsesForMap(ne.lat, ne.lng, sw.lat, sw.lng, resolution);
    }

    private convertH3ToGeoJSON(data: TopCellTopicsByH3Index) {
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
}
