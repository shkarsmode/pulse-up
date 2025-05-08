import {
    Component,
    DestroyRef,
    EventEmitter,
    HostBinding,
    inject,
    Input,
    OnInit,
    Output,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import * as h3 from "h3-js";
import mapboxgl, { EventData, Fog, MapStyleDataEvent } from "mapbox-gl";
import { debounceTime, filter, first, Subject, tap } from "rxjs";
import { PulseService } from "../../../../shared/services/api/pulse.service";
import { HeatmapService } from "../../../../shared/services/core/heatmap.service";
import { MapLocationService } from "../../../../shared/services/core/map-location.service";
import { MAPBOX_STYLE } from "../../../../shared/tokens/tokens";
import { IMapMarker } from "@/app/shared/interfaces/map-marker.interface";
import { IPulse } from "@/app/shared/interfaces";

interface IMapMarkerAnimated extends IMapMarker {
    delay: number;
}

@Component({
    selector: "app-map",
    templateUrl: "./map.component.html",
    styleUrl: "./map.component.scss",
})
export class MapComponent implements OnInit {
    @Input() public pulseId: number;
    @Input() public isPreview: boolean = false;
    @Input() public isToShowHeatmap: boolean = true;
    @Input() public isToShowTooltip: boolean = false;
    @Input() public isHideDebugger: boolean = false;

    @Input() public isSearch: boolean = false;
    @Input() public isZoomButton: boolean = false;
    @Input() public isLocationName: boolean = false;
    @Input() public isRounded: boolean = false;
    @Input() public zoom: [number] = [1];
    @Input() public minZoom: number = 1;
    @Input() public touchPitch: boolean = true;
    @Input() public touchZoomRotate: boolean = true;
    @Input() public isScrollZoomEnabled: boolean = true;
    @Input() public isDoubleClickZoomEnabled: boolean = true;
    @Input() public isMarkerAnimated: boolean = false;
    @Input() public maxBounds: mapboxgl.LngLatBoundsLike | undefined = [
        [-180, -80],
        [180, 85],
    ];
    @Input() public center: [number, number] = [-100.661, 37.7749];
    @Input() public projection: mapboxgl.Projection["name"] = "mercator";
    @Input() public isLabelsHidden: boolean = false;
    @Input() public isMapStatic: boolean = false;
    @Input() public fog: Fog;
    @Input() public zoomResolutionMap: { [key: number]: number } = {
        0: 0,
        1: 0,
        2: 1,
        3: 1,
        3.3: 2,
        4: 2,
        5: 3,
        6.5: 4,
        7: 4,
        8: 5,
        9: 6,
        10: 6,
    };
    @Output() public mapLoaded: EventEmitter<mapboxgl.Map> = new EventEmitter<mapboxgl.Map>();
    @Output() public markerClick: EventEmitter<IMapMarker> = new EventEmitter<IMapMarker>();
    @Output() public zoomEnd: EventEmitter<number> = new EventEmitter<number>();

    @HostBinding("class.preview")
    public get isPreviewMap() {
        return this.isPreview;
    }

    public markers: IMapMarkerAnimated[] = [];
    public weights: any = [];
    public readonly mapboxStylesUrl: string = inject(MAPBOX_STYLE);
    public heatmapIntensity: number = 0.1;

    public map: mapboxgl.Map | null = null;
    public isToShowH3: boolean = true;
    public heatmapDataPointsCount: number = 0;
    public readonly pulseService: PulseService = inject(PulseService);
    public isToShoDebugger: string | null = localStorage.getItem("show-debugger");
    public tooltipData: IPulse | null = null;

    private readonly h3Pulses$: Subject<any> = new Subject();
    private readonly heatMapData$: Subject<{ [key: string]: number }> = new Subject();
    private markerHover$ = new Subject<IMapMarker>();

    private readonly destroyed: DestroyRef = inject(DestroyRef);
    private readonly heatmapService: HeatmapService = inject(HeatmapService);
    private zoomLevels = Object.keys(this.zoomResolutionMap)
        .map(Number)
        .sort((a, b) => a - b);

    constructor(public mapLocationService: MapLocationService) {
        this.markerHover$.pipe(debounceTime(300)).subscribe((marker) => {
            this.tooltipData = null;
            this.pulseService.getById(marker.topicId).subscribe((pulse) => {
                this.tooltipData = pulse;
            });
        });
    }

    public ngOnInit(): void {
        // if (this.isPreview) {}
        this.subscribeOnDataH3Pulses();
        this.subscribeOnDataListHeatmap();
    }

    public onChangeHeatmapSettings(): void {
        this.map?.setPaintProperty("vibes-heat", "heatmap-intensity", +this.heatmapIntensity);

        this.updateHeatmapForMap();
    }

    public toggleH3CellsVisibility(): void {
        let lineWidth = 1.5;
        if (this.isToShowH3) lineWidth = 0;

        this.map?.setPaintProperty("h3-polygons-layer", "line-width", lineWidth);

        this.isToShowH3 = !this.isToShowH3;
    }

    public toggleHeatmapVisibility(): void {
        let opacity = this.heatmapService.heatmapStyles["heatmap-opacity"];
        if (this.isToShowHeatmap) opacity = 0;

        this.map?.setPaintProperty("vibes-heat", "heatmap-opacity", opacity);

        this.isToShowHeatmap = !this.isToShowHeatmap;
    }

    private subscribeOnDataH3Pulses(): void {
        this.h3Pulses$
            .pipe(takeUntilDestroyed(this.destroyed))
            .subscribe(this.addMarkersAndUpdateH3Polygons.bind(this));
    }

    public onMapLoad(map: mapboxgl.Map) {
        this.map = map;

        this.map.dragRotate?.disable();
        this.map.touchZoomRotate.disableRotation();

        this.heatmapService.addSourceToMap(this.map);
        this.heatmapService.addHeatmapToMap();

        this.addInitialLayersAndSourcesToDisplayData();
        this.updateH3Pulses();
        this.updateHeatmapForMap();

        this.map.on("resize", () => {
            this.map?.triggerRepaint();
        });

        this.mapLoaded.next(this.map);

        if(this.fog) {
            this.map.setFog(this.fog);
        }
    }

    public handleZoomEnd = () => {
        this.zoomEnd.emit(this.map?.getZoom() || 0);
        // this.updateH3Pulses();
        // this.updateHeatmapForMap();
    };

    public handleMoveEnd = () => {
        if (this.isMapStatic) return;
        this.updateH3Pulses();
        this.updateHeatmapForMap();
    };

    private addInitialLayersAndSourcesToDisplayData(): void {
        const sourceId = "h3-polygons";

        this.map?.addSource("hexagons", {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: [],
            },
        });

        this.map?.addSource(sourceId, {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: [],
            },
        });

        this.map?.addLayer({
            id: "hexagons",
            type: "fill",
            source: "hexagons",
            layout: {},
            paint: {
                "fill-color": "#7700EE",
                "fill-opacity": 0, // 0.15
            },
        });

        this.map?.addLayer({
            id: "h3-polygons-layer-line",
            type: "line",
            source: sourceId,
            layout: {},
            paint: {
                "line-color": "#FFFFFF",
                "line-width": 2,
                "line-opacity": 0.5,
            },
        });
        this.map?.addLayer({
            id: "h3-polygons-layer-fill",
            type: "fill",
            source: sourceId,
            layout: {},
            paint: {
                "fill-color": "#FFFFFF",
                "fill-opacity": 0.3,
            },
        });
    }

    private addMarkersAndUpdateH3Polygons(h3PulsesData: any): void {
        const geojsonData: any = this.convertH3ToGeoJSON(h3PulsesData);
        (this.map?.getSource("hexagons") as any).setData(geojsonData);
        // this.map?.setPaintProperty('hexagons', 'fill-opacity', 0.15);

        this.addMarkersToMap(h3PulsesData);
        this.addH3PolygonsToMap(Object.keys(h3PulsesData));
    }

    private updateH3Pulses(): void {
        if (!this.map) return;
        this.map?.setPaintProperty("hexagons", "fill-opacity", 0);

        const { _ne, _sw } = this.map.getBounds();
        const resolution = this.getResolutionBasedOnMapZoom();
        const NELat = _ne.lat;
        const NELng = Math.min(_ne.lng, 180);
        const SWLat = _sw.lat;
        const SWLng = Math.max(_sw.lng, -180);
        this.pulseService
            .getH3PulsesForMap(NELat, NELng, SWLat, SWLng, resolution)
            .pipe(
                first(),
                filter(() => !this.pulseId),
            )
            .subscribe((h3PulsesData) => this.h3Pulses$.next(h3PulsesData));
    }

    private updateHeatmapForMap(): void {
        if (!this.map) return;
        const { _ne, _sw } = this.map.getBounds();
        const resolution = this.getResolutionBasedOnMapZoom();
        const NELat = _ne.lat;
        const NELng = Math.min(_ne.lng, 180);
        const SWLat = _sw.lat;
        const SWLng = Math.max(_sw.lng, -180);
        this.pulseService
            .getMapVotes(NELat, NELng, SWLat, SWLng, resolution > 9 ? 7 : resolution, this.pulseId)
            .pipe(
                first(),
                filter(() => this.isToShowHeatmap),
                tap((heatmap) => {
                    this.heatmapDataPointsCount = Object.keys(heatmap).length;
                }),
            )
            .subscribe((votes) => {
                this.heatMapData$.next(votes);
                if (this.isLocationName) {
                    this.updateCurrentLocationAreaName();
                }
            });
    }

    private subscribeOnDataListHeatmap(): void {
        this.heatMapData$
            .pipe(takeUntilDestroyed(this.destroyed))
            .subscribe((heatmapData: { [key: string]: number }) => {
                const resolution = this.getResolutionBasedOnMapZoom();
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

                // const difIntensity = heatmap.resolution / heatmap.cellRadius;
                // const difIntensity = this.getResolutionBasedOnMapZoom() / 0.5;
                // let intensity = difIntensity < 0.5 ? 0.5 : difIntensity;
                // let intensity = this.map.getZoom() > 12 ? 1 : 3;
                // this.heatmapIntensity = intensity;

                this.map?.setPaintProperty(
                    "vibes-heat",
                    "heatmap-intensity",
                    +this.heatmapIntensity,
                );

                const heatmapRadius = this.calculateHeatmapRadius(this.map?.getZoom() || 0);

                this.map?.setPaintProperty("vibes-heat", "heatmap-radius", heatmapRadius);

                this.heatmapService.heatmapData.setData(heatmapGeoJSON);

                if (this.pulseId) {
                    this.addWeightsToMap(updatedHeatmapData);
                }
            });
    }

    public getResolutionBasedOnMapZoom(): number {
        const zoom = this.map?.getZoom();
        if (zoom === undefined || zoom === null) return 7;

        let resolution = 7;
        for (const level of this.zoomLevels) {
            if (zoom >= level) {
                resolution = this.zoomResolutionMap[level];
            } else {
                break;
            }
        }

        return resolution;
    }

    private convertH3ToGeoJSON(data: any) {
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
                    users: data[h3Index].users,
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

    private addMarkersToMap(data: any): void {
        this.markers = [];
        Object.keys(data).forEach((h3Index: any) => {
            const [lat, lng] = h3.h3ToGeo(h3Index);
            this.markers.push({
                lng,
                lat,
                icon: data[h3Index].icon,
                h3Index,
                topicId: data[h3Index].topicId,
                delay: this.randomInteger(100, 2000),
            });
        });
    }

    private addWeightsToMap(data: any): void {
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

    private addH3PolygonsToMap(h3Indexes: string[]): void {
        const hexagons = h3Indexes.filter((h3Index) => !this.isHexagonCrossesAntimeridian(h3Index));

        const hexagonFeatures = hexagons.map((hex) => this.h3ToPolygonFeature(hex));

        const sourceId = "h3-polygons";

        const source = this.map?.getSource(sourceId) as mapboxgl.GeoJSONSource;

        source.setData({
            type: "FeatureCollection",
            features: hexagonFeatures,
        });
    }

    public getStepBasedOnZoom(): number {
        if (!this.map) return 1;
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
        resolution: number,
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
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [boundary],
            },
            properties: {},
        };
    }

    private setDefaultMapSize = () => this.map?.resize();

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
        if (!this.map) return;
        const coordinates = this.mapLocationService.getMapCoordinatesWebClient(this.map);
        this.mapLocationService.getLocationFilter(coordinates, this.map.getBounds().toArray());
    }

    public zoomMapClick(sign: "+" | "-"): void {
        if (!this.map) return;
        let minZoom = this.map.getMinZoom();
        let maxZoom = this.map.getMaxZoom();
        let currentZoom = this.map.getZoom();

        if (sign === "+" && currentZoom < maxZoom) {
            this.map.setZoom(currentZoom + 2); // Zoom in (increase zoom level)
        }
        if (sign === "-" && currentZoom > minZoom) {
            this.map.setZoom(currentZoom - 2); // Zoom out (decrease zoom level)
        }

        return;
    }

    private isHexagonCrossesAntimeridian(h3Index: string) {
        const boundary = h3.h3ToGeoBoundary(h3Index, true);

        let crosses = false;
        for (let i = 0; i < boundary.length - 1; i++) {
            const lon1 = boundary[i][0];
            const lon2 = boundary[i + 1][0];

            if (Math.abs(lon1 - lon2) > 180) {
                crosses = true;
                break;
            }
        }

        return crosses;
    }

    private randomInteger(min: number, max: number) {
        let rand = min + Math.random() * (max + 1 - min);
        return Math.floor(rand);
    }

    public onMarkerHover(marker: IMapMarker): void {
        this.tooltipData = null;
        this.markerHover$.next(marker);
    }

    public onTooltipHide(): void {
        this.tooltipData = null;
    }

    public onMarkerClick(marker: IMapMarker): void {
        this.tooltipData = null;
        this.markerClick.emit(marker);
    }

    public onStyleData(style: MapStyleDataEvent & EventData): void {
        if(!this.isLabelsHidden) return;
        const map = style.target;
        const layers = map.getStyle().layers;
        if (!layers) return;
        for (const layer of layers) {
            if (layer.type === "symbol") {
                map.setLayoutProperty(layer.id, "visibility", "none");
            }
        }
    }
}
