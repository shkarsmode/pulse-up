import { Component, DestroyRef, inject, Input, OnInit } from "@angular/core";
import {
    combineLatest,
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
import * as h3 from "h3-js";
import { MapPainter } from "@/app/shared/helpers/map-painter";
import { MapUtils } from "@/app/shared/services/map/map-utils.service";
import { AppConstants } from "@/app/shared/constants";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { IH3Pulses } from "@/app/features/landing/interfaces/h3-pulses.interface";
import { ICategory } from "@/app/shared/interfaces/category.interface";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
    selector: "app-map-hexagons-layer",
    standalone: true,
    imports: [],
    template: "",
    styles: [``],
})
export class MapHexagonsLayerComponent implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
    private readonly pulseService = inject(PulseService);

    @Input({ required: true }) public map: mapboxgl.Map;
    @Input() public category$: Observable<ICategory | null>;
    @Input() public topicId?: number;

    private dataLoaded = false;
    public painter: MapPainter;

    ngOnInit() {
        this.painter = new MapPainter({
            map: this.map,
            sourceId: "hexagons",
        });
        this.addLayersOnMap(this.painter);
        this.subscribeToHexagonUpdates();
    }

    private subscribeToHexagonUpdates() {
        combineLatest([this.mapDelayedInteraction$(), this.category$ ?? of(null)])
            .pipe(
                switchMap(([, category]) => {
                    return of(this.getResolution()).pipe(
                        map((resolution) => ({ resolution, category })),
                    );
                }),
                filter(({ resolution }) => resolution >= 2 || !this.dataLoaded),
                switchMap(({ category }) => this.getHexagons(category)),
                tap((data) => {
                    this.updateHexagons(data);
                    this.dataLoaded = true;
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();

        combineLatest([this.mapImmediateInteractions$(), this.category$ ?? of(null)])
            .pipe(
                switchMap(([, category]) => this.getHexagons(category)),
                tap((data) => this.updateHexagons(data)),
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

    private getHexagons(category: ICategory | null): Observable<IH3Pulses> {
        const resolution = this.getResolution();

        const { ne, sw } = MapUtils.getMapBounds({
            map: this.map,
        });

        return this.pulseService.getH3PulsesForMap({
            NElatitude: ne.lat,
            NElongitude: ne.lng,
            SWlatitude: sw.lat,
            SWlongitude: sw.lng,
            resolution,
            category: category?.name,
        });
    }

    private updateHexagons(data: IH3Pulses): void {
        const geojson = this.convertH3ToGeoJSON(data);
        this.painter.setSourceData(geojson);
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

    private getResolution() {
        return MapUtils.getResolutionLevel({
            map: this.map,
            resolutionLevelsByZoom: AppConstants.ZOOM_RESOLUTION_MAP,
        });
    }
}
