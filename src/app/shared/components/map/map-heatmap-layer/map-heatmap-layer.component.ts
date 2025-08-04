import { Component, DestroyRef, inject, Input, OnInit } from "@angular/core";
import {
    fromEvent,
    map,
    merge,
    Observable,
    startWith,
    switchMap,
    tap,
    throttleTime,
} from "rxjs";
import { MapUtils } from "@/app/shared/services/map/map-utils.service";
import { AppConstants } from "@/app/shared/constants";
import { MapPainter } from "@/app/shared/helpers/map-painter";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { HeatmapService } from "@/app/shared/services/map/heatmap.service";

@Component({
    selector: "app-map-heatmap-layer",
    template: "",
    styles: [``],
    standalone: true,
    imports: [],
})
export class MapHeatmapLayerComponent implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
    private readonly heatmapService = inject(HeatmapService);

    @Input({ required: true }) public map: mapboxgl.Map;
    @Input() public topicId?: number;

    private readonly sourceId = "vibes";
    public readonly intensity: number = 0.1;
    public painter: MapPainter;
    public heatmapDataPointsCount = 0;

    ngOnInit() {
        this.painter = new MapPainter({
            map: this.map,
            sourceId: "hexagons",
        });
        this.addHeatmapToMap();
        this.subscribeToHexagonUpdates();
    }

    private subscribeToHexagonUpdates() {
        this.mapInteraction$()
            .pipe(
                switchMap(() => this.heatmapService.getHeatmapData(this.map, this.topicId)),
                map((heatmapData) => this.heatmapService.getHeatmapGeoJson(heatmapData)),
                tap((geoJson) => {
                    this.updateHeatmap(geoJson);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    private mapInteraction$(): Observable<Event | null> {
        return merge(
            fromEvent(this.map, "zoomend"),
            fromEvent(this.map, "move").pipe(throttleTime(500)),
        ).pipe(startWith(null));
    }

    private updateHeatmap = (data: GeoJSON.FeatureCollection): void => {
        this.paintIntensity();
        this.paintRadius();
        this.updateHeatmapData(data);
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

    private updateHeatmapData(data: GeoJSON.FeatureCollection): void {
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
