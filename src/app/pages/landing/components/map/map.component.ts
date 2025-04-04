import { Component, DestroyRef, HostBinding, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import * as h3 from 'h3-js';
import mapboxgl from 'mapbox-gl';
import { filter, first, Subject, tap } from 'rxjs';
import { PulseService } from '../../../../shared/services/api/pulse.service';
import { HeatmapService } from '../../../../shared/services/core/heatmap.service';
import { MapLocationService } from '../../../../shared/services/core/map-location.service';
import { MAPBOX_STYLE } from '../../../../shared/tokens/tokens';

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrl: './map.component.scss',
})
export class MapComponent implements OnInit {
    @Input() public pulseId: number;
    @Input() public isPreview: boolean = false;
    @Input() public isToShowHeatmap: boolean = true;
    @Input() public isHideDebugger: boolean = false;

    @Input() public isSearch: boolean = false;
    @Input() public isZoomButton: boolean = false;
    @Input() public isLocationName: boolean = false;

    @HostBinding('class.preview')
    public get isPreviewMap() {
        return this.isPreview;
    }

    public markers: any = [];
    public readonly mapboxStylesUrl: string = inject(MAPBOX_STYLE);
    public center: [number, number] = [-100.661, 37.7749];
    public heatmapIntensity: number = 0.1;

    public map: mapboxgl.Map;
    public isToShowH3: boolean = true;
    public heatmapDataPointsCount: number = 0;
    public readonly pulseService: PulseService = inject(PulseService);
    public isToShoDebugger: string | null = localStorage.getItem('show-debugger');

    private readonly h3Pulses$: Subject<any> = new Subject();
    private readonly heatMapData$: Subject<{ [key: string]: number }> =
        new Subject();

    private readonly destroyed: DestroyRef = inject(DestroyRef);
    private readonly heatmapService: HeatmapService = inject(HeatmapService);


    constructor(
        public mapLocationService: MapLocationService,
    ) {}

    public ngOnInit(): void {
        // if (this.isPreview) {}
        this.subscribeOnDataH3Pulses();
        this.subscribeOnDataListHeatmap();
    }


    public onChangeHeatmapSettings(): void {
        this.map.setPaintProperty(
            'vibes-heat',
            'heatmap-intensity',
            +this.heatmapIntensity
        );

        this.updateHeatmapForMap();
    }

    public toggleH3CellsVisibility(): void {
        let lineWidth = 1.5;
        if (this.isToShowH3) lineWidth = 0;

        this.map?.setPaintProperty(
            'h3-polygons-layer',
            'line-width',
            lineWidth
        );

        this.isToShowH3 = !this.isToShowH3;
    }

    public toggleHeatmapVisibility(): void {
        let opacity = this.heatmapService.heatmapStyles['heatmap-opacity'];
        if (this.isToShowHeatmap) opacity = 0;

        this.map.setPaintProperty('vibes-heat', 'heatmap-opacity', opacity);

        this.isToShowHeatmap = !this.isToShowHeatmap;
    }

    private subscribeOnDataH3Pulses(): void {
        this.h3Pulses$
            .pipe(takeUntilDestroyed(this.destroyed))
            .subscribe(this.addMarkersAndUpdateH3Polygons.bind(this));
    }

    public onMapLoad(map: mapboxgl.Map) {
        this.map = map;
        console.log('Map', this.map);

        this.map.dragRotate?.disable();
        this.map.touchZoomRotate.disableRotation();

        this.heatmapService.addSourceToMap(this.map);
        this.heatmapService.addHeatmapToMap();

        this.addInitialLayersAndSourcesToDisplayData();
        this.addH3PolygonsToMap();
        this.updateH3Pulses();
        this.updateHeatmapForMap();
    }

    public handleZoomEnd = () => {
        // this.updateH3Pulses();
        // this.updateHeatmapForMap();
    };

    public handleMoveEnd = () => {
        this.updateH3Pulses();
        this.updateHeatmapForMap();
    };

    private addInitialLayersAndSourcesToDisplayData(): void {
        const sourceId = 'h3-polygons';

        this.map.addSource('hexagons', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: [],
            },
        });

        this.map.addSource(sourceId, {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: [],
            },
        });

        this.map.addLayer({
            id: 'hexagons',
            type: 'fill',
            source: 'hexagons',
            layout: {},
            paint: {
                'fill-color': '#7700EE',
                'fill-opacity': 0, // 0.15
            },
        });

        this.map.addLayer({
            id: 'h3-polygons-layer',
            type: 'line',
            source: sourceId,
            layout: {},
            paint: {
                'line-color': '#FFFFFF',
                'line-width': 1.5,
            },
        });
    }

    private addMarkersAndUpdateH3Polygons(h3PulsesData: any): void {
        const geojsonData: any = this.convertH3ToGeoJSON(h3PulsesData);
        (this.map.getSource('hexagons') as any).setData(geojsonData);
        // this.map?.setPaintProperty('hexagons', 'fill-opacity', 0.15);

        this.addMarkersToMap(h3PulsesData);
    }

    private updateH3Pulses(): void {
        this.map?.setPaintProperty('hexagons', 'fill-opacity', 0);
        this.addH3PolygonsToMap();

        const { _ne, _sw } = this.map.getBounds();
        const resolution = this.getResolutionBasedOnMapZoom();

        this.pulseService
            .getH3PulsesForMap(_ne.lat, _ne.lng, _sw.lat, _sw.lng, resolution)
            .pipe(
                first(),
                filter(() => !this.pulseId)
            )
            .subscribe((h3PulsesData) => this.h3Pulses$.next(h3PulsesData));
    }

    private updateHeatmapForMap(): void {
        const { _ne, _sw } = this.map.getBounds();
        const resolution = this.getResolutionBasedOnMapZoom();

        this.pulseService
            .getMapVotes(
                _ne.lat,
                _ne.lng,
                _sw.lat,
                _sw.lng,
                resolution > 9 ? 7 : resolution,
                this.pulseId
            )
            .pipe(
                first(),
                filter(() => this.isToShowHeatmap),
                tap(
                    (heatmap) =>
                        (this.heatmapDataPointsCount =
                            Object.keys(heatmap).length)
                )
            )
            .subscribe((votes) => { 
                this.heatMapData$.next(votes)

                this.updateCurrentLocationAreaName();
            });
    }

    private subscribeOnDataListHeatmap(): void {
        this.heatMapData$
            .pipe(takeUntilDestroyed(this.destroyed))
            .subscribe((heatmap: { [key: string]: number }) => {
                const updatedHeatmapData = Object.keys(heatmap).map(
                    (key: string) => ({
                        coords: h3.h3ToGeo(key),
                        value: heatmap[key],
                    })
                );

                const heatmapFeatures = updatedHeatmapData.map(
                    ({ coords, value }) => ({
                        type: 'Feature',
                        properties: {
                            value: value,
                        },
                        geometry: {
                            type: 'Point',
                            coordinates: [coords[1], coords[0]],
                        },
                    })
                );

                const heatmapGeoJSON = {
                    type: 'FeatureCollection',
                    features: heatmapFeatures,
                };

                // const difIntensity = heatmap.resolution / heatmap.cellRadius;
                // const difIntensity = this.getResolutionBasedOnMapZoom() / 0.5;
                // let intensity = difIntensity < 0.5 ? 0.5 : difIntensity;
                // let intensity = this.map.getZoom() > 12 ? 1 : 3;
                // this.heatmapIntensity = intensity;

                this.map.setPaintProperty(
                    'vibes-heat',
                    'heatmap-intensity',
                    +this.heatmapIntensity
                );

                const heatmapRadius = this.calculateHeatmapRadius(
                    this.map.getZoom()
                );

                this.map.setPaintProperty(
                    'vibes-heat',
                    'heatmap-radius',
                    heatmapRadius
                );

                this.heatmapService.heatmapData.setData(heatmapGeoJSON);
            });
    }

    public getResolutionBasedOnMapZoom(): number {
        const zoom = this.map?.getZoom();

        const zoomResolutionMap: { [key: number]: number } = {
            0: 1,
            1: 1,
            2: 1,
            3: 1,
            4: 2,
            5: 2,
            6: 3,
            7: 4,
            8: 4,
            9: 5,
            10: 6,
            11: 7,
            12: 7,
            13: 7,
            14: 7,
            15: 7,
        };

        return zoomResolutionMap[Math.floor(zoom)] || 7;
    }

    private convertH3ToGeoJSON(data: any) {
        const features = Object.keys(data).map((h3Index) => {
            const polygon = h3.h3ToGeoBoundary(h3Index, true);
            return {
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [polygon],
                },
                properties: {
                    votes: data[h3Index].votes,
                    users: data[h3Index].users,
                    icon: data[h3Index].icon,
                    h3Index,
                },
            };
        });

        return {
            type: 'FeatureCollection',
            features,
        };
    }

    private addMarkersToMap(data: any): void {
        this.markers = [];
        Object.keys(data).forEach((h3Index: any) => {
            const [lat, lng] = h3.h3ToGeo(h3Index);
            this.markers.push({
                lng,
                lat,
                icon: data[h3Index].icon,
                h3Index,
            });
        });
    }

    private addH3PolygonsToMap(): void {
        const bounds = this.map.getBounds();
        const northWest = bounds.getNorthWest();
        const southEast = bounds.getSouthEast();
        const resolution = this.getResolutionBasedOnMapZoom();

        const hexagons = this.getHexagonsForBounds(
            northWest,
            southEast,
            resolution
        );

        const hexagonFeatures = hexagons.map((hex) =>
            this.h3ToPolygonFeature(hex)
        );

        const sourceId = 'h3-polygons';

        const source = this.map.getSource(sourceId) as mapboxgl.GeoJSONSource;

        source.setData({
            type: 'FeatureCollection',
            features: hexagonFeatures,
        });
    }

    public getStepBasedOnZoom(): number {
        const zoom = this.map?.getZoom();
        if (zoom < 4) return 1;
        if (zoom < 5) return 0.5;
        if (zoom < 7) return 0.15;
        if (zoom < 9) return 0.02;
        if (zoom < 12) return 0.005;
        if (zoom < 15) return 0.001;
        return 0.0001;
    }

    private getHexagonsForBounds(
        northWest: mapboxgl.LngLat,
        southEast: mapboxgl.LngLat,
        resolution: number
    ): string[] {
        const hexagons = [];
        const step = this.getStepBasedOnZoom();

        for (let lat = southEast.lat; lat < northWest.lat; lat += step) {
            for (let lng = northWest.lng; lng < southEast.lng; lng += step) {
                const hex = h3.geoToH3(lat, lng, resolution);
                hexagons.push(hex);
            }
        }

        return [...new Set(hexagons)];
    }

    private h3ToPolygonFeature(hex: string): GeoJSON.Feature<GeoJSON.Polygon> {
        const boundary = h3.h3ToGeoBoundary(hex, true);
        return {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [boundary],
            },
            properties: {},
        };
    }

    private setDefaultMapSize = () => this.map.resize();

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


    private updateCurrentLocationAreaName() {
        const coordinates = this.mapLocationService.getMapCoordinatesWebClient(this.map);
        this.mapLocationService.getLocationFilter(
            coordinates,
            this.map.getBounds().toArray()
        );
        // console.log(this.mapLocationService.mapLocationFilter)    
    }


    public zoomMapClick(sign: "+" | "-"): void {
        let minZoom = this.map.getMinZoom();
        let maxZoom = this.map.getMaxZoom();
        let currentZoom = this.map.getZoom();
        
        if(sign === '+' && currentZoom < maxZoom) {
            this.map.setZoom(currentZoom + 2); // Zoom in (increase zoom level)
        } 
        if(sign === '-' && currentZoom > minZoom) {
            this.map.setZoom(currentZoom - 2); // Zoom out (decrease zoom level)
        }
        
        return;
    }


    

}
