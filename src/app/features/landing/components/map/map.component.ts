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
import { CommonModule } from "@angular/common";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import * as h3 from "h3-js";
import mapboxgl, { EventData, Fog, MapStyleDataEvent } from "mapbox-gl";
import { NgxMapboxGLModule } from "ngx-mapbox-gl";
import { filter, first, Subject, tap } from "rxjs";
import { SvgIconComponent } from "angular-svg-icon";

import { PulseService } from "../../../../shared/services/api/pulse.service";
import { MapLocationService } from "../../../../shared/services/core/map-location.service";
import { MAPBOX_STYLE } from "../../../../shared/tokens/tokens";
import { IMapMarker } from "@/app/shared/interfaces/map-marker.interface";
import { MapUtils } from "../../services/map-utils.service";
import { FormatNumberPipe } from "@/app/shared/pipes/format-number.pipe";
import { InputComponent } from "@/app/shared/components/ui-kit/input/input.component";
import { SecondaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/secondary-button/secondary-button.component";
import { H3LayerService } from "../../services/h3-layer.service";
import { IH3Pulses } from "../../interfaces/h3-pulses.interface";
import { MapMarkersService } from "../../services/map-markers.service";
import { HeatmapLayerService } from "../../services/heatmap-layer.service";
import { MediaUtilsService } from "../../services/media-utils.service";
import { MapMarkerComponent } from "./components/map-marker/map-marker/map-marker.component";
import { GlobeSpinnerService } from "../../services/globe-spinner.service";
import { throttle } from "@/app/shared/helpers/throttle";
import { MapBounds } from "../../interfaces/map-bounds.interface";

@Component({
    selector: "app-map",
    templateUrl: "./map.component.html",
    styleUrl: "./map.component.scss",
    standalone: true,
    imports: [
        CommonModule,
        NgxMapboxGLModule,
        FormsModule,
        SvgIconComponent,
        InputComponent,
        SecondaryButtonComponent,
        MapMarkerComponent,
        FormatNumberPipe,
    ],
})
export class MapComponent implements OnInit {
    private readonly mapboxStylesUrl: string = inject(MAPBOX_STYLE);
    private readonly pulseService: PulseService = inject(PulseService);
    private readonly h3LayerService: H3LayerService = inject(H3LayerService);
    private readonly mapMarkersService: MapMarkersService = inject(MapMarkersService);
    private readonly destroyed: DestroyRef = inject(DestroyRef);
    private readonly heatmapLayerService: HeatmapLayerService = inject(HeatmapLayerService);
    private readonly mapLocationService: MapLocationService = inject(MapLocationService);
    private readonly globeSpinner = new GlobeSpinnerService();

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
    @Input() public isSpinEnabled: boolean = false;
    @Input() public fog: Fog | null = null;
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
    @Input() public mapStylesUrl: string = this.mapboxStylesUrl;
    @Output() public mapLoaded: EventEmitter<mapboxgl.Map> = new EventEmitter<mapboxgl.Map>();
    @Output() public markerClick: EventEmitter<IMapMarker> = new EventEmitter<IMapMarker>();
    @Output() public zoomEnd: EventEmitter<number> = new EventEmitter<number>();

    @HostBinding("class.preview")
    public get isPreviewMap() {
        return this.isPreview;
    }

    public map: mapboxgl.Map | null = null;
    public isToShowH3: boolean = true;
    public heatmapDataPointsCount: number = 0;
    public isToShoDebugger: string | null = localStorage.getItem("show-debugger");
    public isTouchDevice = false;
    public isSpinButtonVisible = this.isSpinEnabled;
    private globalMapDataUpdated: boolean = false;

    private readonly h3Pulses$: Subject<IH3Pulses> = new Subject();
    private readonly heatMapData$: Subject<{ [key: string]: number }> = new Subject();

    public ngOnInit(): void {
        this.subscribeOnDataH3Pulses();
        this.subscribeOnDataListHeatmap();
        this.checkIfTouchDevice();
    }

    get markers() {
        return this.mapMarkersService.markers;
    }
    get weights() {
        return this.heatmapLayerService.weights;
    }
    get tooltipData() {
        return this.mapMarkersService.tooltipData;
    }
    get mapLocationFilter() {
        return this.mapLocationService.mapLocationFilter;
    }
    get heatmapIntensity() {
        return this.heatmapLayerService.intensity;
    }
    get isToShowMarkers() {
        return !this.pulseId;
    }
    get currentHeatmapDepth() {
        return this.pulseService.currentHeatmapDepth;
    }
    get isSpinning() {
        return this.globeSpinner.spinning;
    }

    public onChangeHeatmapSettings(): void {
        if (!this.map) return;
        this.heatmapLayerService.paintHeatmapIntensity(this.map);
        this.updateHeatmap();
    }

    public toggleH3CellsVisibility(): void {
        if (!this.map) return;
        let lineWidth = 1.5;
        if (this.isToShowH3) lineWidth = 0;

        MapUtils.updatePaintProperty({
            map: this.map,
            layerId: "h3-polygons-layer",
            property: "line-width",
            value: lineWidth,
        });

        this.isToShowH3 = !this.isToShowH3;
    }

    public toggleHeatmapVisibility(): void {
        if (!this.map) return;
        let opacity = this.heatmapLayerService.heatmapStyles["heatmap-opacity"];
        if (this.isToShowHeatmap) opacity = 0;
        this.heatmapLayerService.paintHeatmapOpacity(this.map, opacity);
        this.isToShowHeatmap = !this.isToShowHeatmap;
    }

    private checkIfTouchDevice(): void {
        this.isTouchDevice = MediaUtilsService.checkIfTouchDevice();
    }

    private subscribeOnDataH3Pulses(): void {
        this.h3Pulses$
            .pipe(takeUntilDestroyed(this.destroyed))
            .subscribe(this.addMarkersAndUpdateH3Polygons.bind(this));
    }

    public onMapLoad({ target: map }: mapboxgl.MapboxEvent<undefined> & mapboxgl.EventData) {
        this.map = map;
        this.mapLoaded.next(this.map);

        this.map.dragRotate?.disable();
        this.map.touchZoomRotate.disableRotation();

        this.addInitialLayersAndSourcesToDisplayData();
        this.updateH3Pulses();
        this.updateHeatmap();
        this.triggerRepaintOnResize();
        this.syncFog();
        this.initGlobeSpinner();

        this.globalMapDataUpdated = true;
    }

    public handleZoomEnd = () => {
        this.globalMapDataUpdated = false;
        this.updateSpinButtonVisibility();
        this.zoomEnd.emit(this.map?.getZoom() || 0);
    };

    public handleMoveEnd = throttle(() => {
        if (this.shouldFetchGlobalMapData()) {
            if (!this.globalMapDataUpdated) {
                this.updateH3Pulses();
                this.updateHeatmap();
                this.globalMapDataUpdated = true;
            }
        } else {
            this.updateH3Pulses();
            this.updateHeatmap();
            this.globalMapDataUpdated = false;
        }
        this.updateSpinButtonVisibility();
    }, 1000);

    private addInitialLayersAndSourcesToDisplayData(): void {
        if (!this.map) return;
        const hexagonsSourceId = "hexagons";
        const h3PoligonsSourceId = "h3-polygons";
        MapUtils.addGeoJsonSource({
            id: hexagonsSourceId,
            map: this.map,
            data: {
                type: "FeatureCollection",
                features: [],
            },
        });
        MapUtils.addGeoJsonSource({
            id: h3PoligonsSourceId,
            map: this.map,
            data: {
                type: "FeatureCollection",
                features: [],
            },
        });
        MapUtils.addFillLayer({
            sourceId: hexagonsSourceId,
            layerId: "hexagons",
            map: this.map,
            data: {
                "fill-color": "#7700EE",
                "fill-opacity": 0, // 0.15
            },
        });
        MapUtils.addLineLayer({
            sourceId: h3PoligonsSourceId,
            layerId: "h3-polygons-layer-line",
            map: this.map,
            data: {
                "line-color": "#FFFFFF",
                "line-width": 2,
                "line-opacity": 0.5,
            },
        });
        MapUtils.addFillLayer({
            sourceId: h3PoligonsSourceId,
            layerId: "h3-polygons-layer-fill",
            map: this.map,
            data: {
                "fill-color": "#FFFFFF",
                "fill-opacity": 0.3,
            },
        });

        this.heatmapLayerService.addHeatmapToMap(this.map);
    }

    private addMarkersAndUpdateH3Polygons(h3PulsesData: IH3Pulses): void {
        if (!this.map) return;
        this.h3LayerService.updateH3PolygonSource({ map: this.map, data: h3PulsesData });

        this.mapMarkersService.updateMarkers(h3PulsesData);
        this.h3LayerService.addH3PolygonsToMap({
            map: this.map,
            h3Indexes: Object.keys(h3PulsesData),
        });
    }

    private updateH3Pulses(): void {
        if (!this.map) return;
        MapUtils.updatePaintProperty({
            map: this.map,
            layerId: "hexagons",
            property: "fill-opacity",
            value: 0,
        });

        const resolution = MapUtils.getResolutionLevel({
            map: this.map,
            resolutionLevelsByZoom: this.zoomResolutionMap,
        });

        const bounds = this.getMapBounds({
            global: this.shouldFetchGlobalMapData(),
        });

        this.h3LayerService
            .getH3Pulses({ bounds, resolution })
            .pipe(
                first(),
                filter(() => !this.pulseId),
            )
            .subscribe((h3PulsesData) => this.h3Pulses$.next(h3PulsesData));
    }

    private updateHeatmap(): void {
        if (!this.map) return;
        const resolution = MapUtils.getResolutionLevel({
            map: this.map,
            resolutionLevelsByZoom: this.zoomResolutionMap,
        });

        const bounds = this.getMapBounds({
            global: this.shouldFetchGlobalMapData(),
        });

        this.heatmapLayerService
            .getHeatmapData({
                bounds,
                resolution: resolution > 9 ? 7 : resolution,
                pulseId: this.pulseId,
            })
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
                if (!this.map) return;
                const resolution = MapUtils.getResolutionLevel({
                    map: this.map,
                    resolutionLevelsByZoom: this.zoomResolutionMap,
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

                this.heatmapLayerService.paintHeatmapIntensity(this.map);

                this.heatmapLayerService.paintHeatmapRadius(this.map);

                this.heatmapLayerService.updateHeatmap({
                    map: this.map,
                    data: heatmapGeoJSON,
                });
                if (this.pulseId) {
                    this.heatmapLayerService.addWeightsToMap(updatedHeatmapData);
                }
            });
    }

    private triggerRepaintOnResize(): void {
        if (!this.map) return;
        this.map.on("resize", () => {
            this.map?.triggerRepaint();
        });
    }

    private syncFog() {
        if (this.fog) {
            this.map?.setFog(this.fog);
        }
    }

    private initGlobeSpinner() {
        if (!this.map || this.projection !== "globe") return;
        this.globeSpinner.init(this.map);
    }

    private updateCurrentLocationAreaName() {
        if (!this.map) return;
        const coordinates = this.mapLocationService.getMapCoordinatesWebClient(this.map);
        this.mapLocationService.getLocationFilter(coordinates, this.map.getBounds().toArray());
    }

    private getMapBounds(options?: { global?: boolean }): MapBounds {
        const globalBounds = {
            ne: { lat: 90, lng: 180 },
            sw: { lat: -90, lng: -180 },
        };
        if (!this.map || options?.global) return globalBounds;
        const bounds = this.map.getBounds();
        return {
            ne: {
                lat: Math.min(bounds.getNorthEast().lat, 90),
                lng: Math.min(bounds.getNorthEast().lng, 180),
            },
            sw: {
                lat: Math.max(bounds.getSouthWest().lat, -90),
                lng: Math.max(bounds.getSouthWest().lng, -180),
            },
        };
    }

    private shouldFetchGlobalMapData(): boolean {
        if (this.map && this.map.getZoom() <= 3.3 && this.projection === "globe") {
            return true;
        }
        return false;
    }

    private updateSpinButtonVisibility(): void {
        if (!this.map) return;

        if (!this.isSpinEnabled) {
            this.isSpinButtonVisible = false;
            return;
        }
        if (this.map.getZoom() <= this.globeSpinner.maxSpinZoom && this.projection === "globe") {
            this.isSpinButtonVisible = true;
        } else {
            this.isSpinButtonVisible = false;
        }
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

    public getResolutionBasedOnMapZoom(): number {
        if (!this.map) return 0;
        return MapUtils.getResolutionLevel({
            map: this.map,
            resolutionLevelsByZoom: this.zoomResolutionMap,
        });
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

    public onMarkerHover(marker: IMapMarker): void {
        this.mapMarkersService.tooltipData = null;
        this.mapMarkersService.markerHover$.next(marker);
    }

    public onTooltipHide(): void {
        this.mapMarkersService.tooltipData = null;
    }

    public onMarkerClick(marker: IMapMarker): void {
        this.mapMarkersService.tooltipData = null;
        this.markerClick.emit(marker);
    }

    public onSpinClick(): void {
        this.globeSpinner.toggle();
    }

    public onStyleData(style: MapStyleDataEvent & EventData): void {
        if (!this.isLabelsHidden) return;
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
