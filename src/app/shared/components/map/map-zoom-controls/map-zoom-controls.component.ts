import { Component, Input } from "@angular/core";
import mapboxgl from "mapbox-gl";

@Component({
    selector: "app-map-zoom-controls",
    standalone: true,
    imports: [],
    templateUrl: "./map-zoom-controls.component.html",
    styleUrl: "./map-zoom-controls.component.scss",
})
export class MapZoomControlsComponent {
    @Input() map: mapboxgl.Map;

    public zoomMapClick(sign: "+" | "-"): void {
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
}
