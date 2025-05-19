import { Component, EventEmitter, inject, Input, OnInit, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgxMapboxGLModule } from "ngx-mapbox-gl";
import { EventData, MapStyleDataEvent } from "mapbox-gl";
import { MAPBOX_STYLE } from "@/app/shared/tokens/tokens";
import { IMapOptions } from "../../interfaces/map-options.interface";
import { throttle } from "@/app/shared/helpers/throttle";
import { IMapClickEvent } from "../../interfaces/map-click-event.interface";
import { IMapStyleDataEvent } from "../../interfaces/map-style-data-event.interface";
import { IMapTouchEvent } from "../../interfaces/map-touch-event.interface";

@Component({
    selector: "app-mgl-map",
    templateUrl: "./mgl-map.component.html",
    styleUrls: ["./mgl-map.component.scss"],
    standalone: true,
    imports: [CommonModule, NgxMapboxGLModule],
})
export class MglMapComponent implements OnInit {
    private readonly mapboxStylesUrl: string = inject(MAPBOX_STYLE);

    @Input() public options: IMapOptions = {
        rounded: false,
        preview: false,
        zoom: [1],
        minZoom: 1,
        maxBounds: [
            [-180, -80],
            [180, 85],
        ],
        center: [-100.661, 37.7749],
        scrollZoom: true,
        doubleClickZoom: false,
        projection: "mercator",
    };

    @Output() public mapLoaded: EventEmitter<mapboxgl.Map> = new EventEmitter<mapboxgl.Map>();
    @Output() public mapStyleData: EventEmitter<IMapStyleDataEvent> = new EventEmitter<IMapStyleDataEvent>();
    @Output() public move: EventEmitter<void> = new EventEmitter<void>();
    @Output() public moveEnd: EventEmitter<void> = new EventEmitter<void>();
    @Output() public zoomEnd: EventEmitter<number> = new EventEmitter<number>();
    @Output() public click: EventEmitter<IMapClickEvent> = new EventEmitter<IMapClickEvent>();
    @Output() public touchStart: EventEmitter<IMapTouchEvent> = new EventEmitter<IMapTouchEvent>();

    public classes = {};
    public mapStylesUrl = this.mapboxStylesUrl;
    public map: mapboxgl.Map | null = null;

    ngOnInit(): void {
        this.classes = {
            maps: true,
            maps__rounded: this.options.rounded,
            maps__preview: this.options.preview,
        };
    }

    public onMapLoad({ target: map }: mapboxgl.MapboxEvent<undefined> & mapboxgl.EventData) {
        this.map = map;
        this.mapLoaded.next(this.map);
    }

    public onStyleData(style: MapStyleDataEvent & EventData): void {
        this.mapStyleData.emit(style);
    }

    public onMove = throttle(() => this.move.emit(), 500);

    public onMoveEnd() {
        this.moveEnd.emit();
    }

    public onZoomEnd() {
        if (this.map) {
            const zoom = this.map.getZoom();
            this.zoomEnd.emit(zoom);
        }
    }

    public onClick(event: mapboxgl.MapMouseEvent & mapboxgl.EventData) {
        if (event.lngLat) {
            this.click.emit({
                coordinates: {
                    lat: event.lngLat.lat,
                    lng: event.lngLat.lng,
                },
            });
        }
    }

    public onTouchStart(event: IMapTouchEvent) {
        this.touchStart.emit(event);
    }
}
