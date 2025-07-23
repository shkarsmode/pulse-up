import { Component } from "@angular/core";
import { MapComponent } from "@/app/shared/components/map/map.component";
import { MapHexagonsLayerComponent } from "@/app/shared/components/map/map-hexagons-layer/map-hexagons-layer.component";
import { MapHeatmapLayerComponent } from "@/app/shared/components/map/map-heatmap-layer/map-heatmap-layer.component";

@Component({
    selector: "app-simple-map",
    templateUrl: "./simple-map.component.html",
    styleUrls: ["./simple-map.component.scss"],
    standalone: true,
    imports: [MapComponent, MapHexagonsLayerComponent, MapHeatmapLayerComponent],
})
export class SimpleMapComponent {
  map: mapboxgl.Map | null = null;

  onMapLoaded(map: mapboxgl.Map) {
    this.map = map;
  }
}