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
                tap((heatmapData) => {
                    const geoJson = this.heatmapService.getHeatmapGeoJson(heatmapData);
                    this.updateHeatmap(geoJson);

                    // Debug log: report number of points and sample coords
                    try {
                        console.debug('[MapHeatmap] received heatmap data, points:', heatmapData.length);
                        if (heatmapData.length > 0) {
                            console.debug('[MapHeatmap] sample point coords:', heatmapData[0].coords);
                        }
                    } catch (e) {
                        // ignore
                    }

                    // Fit map to data bounds on first load
                    if (!this.dataLoaded && heatmapData.length > 0) {
                        console.debug('[MapHeatmap] fitting map to bounds (first load)');
                        this.fitMapToBounds(heatmapData);
                    }

                    // Fallback: if no local data, try fetching global data for topic
                    if (!this.dataLoaded && heatmapData.length === 0 && this.topicId) {
                        console.debug('[MapHeatmap] no local data — fetching global data fallback');
                        this.heatmapService
                            .getHeatmapDataForBounds(90, 180, -90, -180, 1, this.topicId)
                            .pipe(takeUntilDestroyed(this.destroyRef))
                            .subscribe((globalData) => {
                                console.debug('[MapHeatmap] global fallback points:', globalData.length);
                                if (globalData.length > 0) {
                                    const globalGeo = this.heatmapService.getHeatmapGeoJson(globalData);
                                    this.updateHeatmap(globalGeo);
                                    this.fitMapToBounds(globalData);
                                } else {
                                    // No global data — fallback to view of Americas
                                    console.debug('[MapHeatmap] no global data — zooming to Americas fallback');
                                    try {
                                        this.map.flyTo({ center: [-95, 37], zoom: 3.5, duration: 1500 });
                                    } catch (e) {
                                        // ignore
                                    }
                                }
                            });
                    }

                    this.dataLoaded = true;
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();

        this.mapImmediateInteractions$()
            .pipe(
                switchMap(() => this.heatmapService.getHeatmapData(this.map, this.topicId)),
                tap((heatmapData) => {
                    const geoJson = this.heatmapService.getHeatmapGeoJson(heatmapData);
                    this.updateHeatmap(geoJson);

                    // Also try to fit on initial immediate emission if not yet fitted
                    try {
                        console.debug('[MapHeatmap] immediate fetch, points:', heatmapData.length);
                    } catch (e) {}

                    if (!this.dataLoaded && heatmapData.length > 0) {
                        console.debug('[MapHeatmap] immediate fetch — fitting bounds (first load)');
                        this.fitMapToBounds(heatmapData);
                        this.dataLoaded = true;
                        return;
                    }

                    if (!this.dataLoaded && heatmapData.length === 0 && this.topicId) {
                        console.debug('[MapHeatmap] immediate fetch — no local data, fetching global fallback');
                        this.heatmapService
                            .getHeatmapDataForBounds(90, 180, -90, -180, 1, this.topicId)
                            .pipe(takeUntilDestroyed(this.destroyRef))
                            .subscribe((globalData) => {
                                console.debug('[MapHeatmap] immediate global fallback points:', globalData.length);
                                if (globalData.length > 0) {
                                    const globalGeo = this.heatmapService.getHeatmapGeoJson(globalData);
                                    this.updateHeatmap(globalGeo);
                                    this.fitMapToBounds(globalData);
                                } else {
                                    console.debug('[MapHeatmap] immediate fallback to Americas');
                                    try {
                                        this.map.flyTo({ center: [-95, 37], zoom: 3.5, duration: 1500 });
                                    } catch (e) {}
                                }
                            });
                    }
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    private fitMapToBounds(heatmapData: any[]): void {
        if (heatmapData.length === 0) return;

        // Calculate bounds from heatmap data
        let minLat = heatmapData[0].coords[0];
        let maxLat = heatmapData[0].coords[0];
        let minLng = heatmapData[0].coords[1];
        let maxLng = heatmapData[0].coords[1];

        for (const point of heatmapData) {
            const [lat, lng] = point.coords;
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
            minLng = Math.min(minLng, lng);
            maxLng = Math.max(maxLng, lng);
        }

        // Add padding to bounds (10% on each side)
        const latPadding = (maxLat - minLat) * 0.1;
        const lngPadding = (maxLng - minLng) * 0.1;

        const bounds: mapboxgl.LngLatBoundsLike = [
            [minLng - lngPadding, minLat - latPadding],
            [maxLng + lngPadding, maxLat + latPadding],
        ];

        // Fit map to bounds with animation
        this.map.fitBounds(bounds, {
            padding: 50,
            duration: 1500,
            maxZoom: 15,
        });
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
