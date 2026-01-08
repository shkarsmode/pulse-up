import { AppConstants } from "@/app/shared/constants";
import { MapPainter } from "@/app/shared/helpers/map-painter";
import { GlobeSettingsService } from "@/app/shared/services/map/globe-settings.service";
import { HeatmapService } from "@/app/shared/services/map/heatmap.service";
import { MapUtils } from "@/app/shared/services/map/map-utils.service";
import { Component, DestroyRef, effect, inject, Input, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
    delay,
    filter,
    fromEvent,
    map,
    merge,
    Observable,
    of,
    startWith,
    switchMap,
    tap,
    throttle,
} from "rxjs";

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
    private readonly globeSettings = inject(GlobeSettingsService);

    @Input({ required: true }) public map: mapboxgl.Map;
    @Input() public topicId?: number;

    private readonly sourceId = "vibes";
    private dataLoaded = false;
    public intensity: number = 0.1;
    public painter: MapPainter;
    public heatmapDataPointsCount = 0;

    constructor() {
        effect(() => {
            if (!this.map) return;
            const intensity = this.globeSettings.heatmapIntensity();
            this.intensity = intensity;
            this.paintIntensity();
        });

        effect(() => {
            if (!this.map) return;
            // Trigger radius repaint when setting changes
            this.globeSettings.heatmapRadius();
            this.paintRadius();
        });

        effect(() => {
            if (!this.map) return;
            const opacity = this.globeSettings.heatmapOpacity();
            MapUtils.updatePaintProperty({
                map: this.map,
                layerId: "vibes-heat",
                property: "heatmap-opacity",
                value: ["interpolate", ["linear"], ["zoom"], 0, opacity, 15, opacity],
            });
        });
    }

    ngOnInit() {
        this.painter = new MapPainter({
            map: this.map,
            sourceId: "hexagons",
        });
        this.addHeatmapToMap();
        this.subscribeToHexagonUpdates();
    }

    private subscribeToHexagonUpdates() {
        this.mapDelayedInteraction$()
            .pipe(
                switchMap(() => of(this.getResolution())),
                filter((resolution) => resolution >= 2 || !this.dataLoaded),
                switchMap(() => this.heatmapService.getHeatmapData(this.map, this.topicId)),
                map((heatmapData) => this.heatmapService.getHeatmapGeoJson(heatmapData)),
                tap((geoJson) => {
                    this.updateHeatmap(geoJson);
                    this.dataLoaded = true;
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();

        this.mapImmediateInteractions$()
            .pipe(
                switchMap(() => this.heatmapService.getHeatmapData(this.map, this.topicId)),
                map((heatmapData) => this.heatmapService.getHeatmapGeoJson(heatmapData)),
                tap((geoJson) => this.updateHeatmap(geoJson)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    private mapImmediateInteractions$(): Observable<Event | null> {
        const zoomend$ = fromEvent(this.map, "zoomend");
        const moveend$ = fromEvent(this.map, "dragend");
        return merge(zoomend$, moveend$).pipe(startWith(null));
    }

    private mapDelayedInteraction$(): Observable<Event | null> {
        return fromEvent(this.map, "move").pipe(
            throttle(() => {
                const zoom = this.map.getZoom();
                const delayMs = MapUtils.interpolateDelay(zoom);
                return of(null).pipe(delay(delayMs));
            }),
        );
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
        const baseRadius = this.globeSettings.heatmapRadius();
        const radiusMap = [
            { zoom: 0, radius: baseRadius },
            { zoom: 5, radius: baseRadius },
            { zoom: 10, radius: baseRadius * 1.2 },
            { zoom: 15, radius: baseRadius * 1.4 },
            { zoom: 20, radius: baseRadius },
        ];

        let radius = baseRadius;
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

    private getResolution() {
        return MapUtils.getResolutionLevel({
            map: this.map,
            resolutionLevelsByZoom: AppConstants.ZOOM_RESOLUTION_MAP,
        });
    }
}
