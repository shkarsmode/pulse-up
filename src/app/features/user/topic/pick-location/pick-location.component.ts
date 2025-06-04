import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import mapboxgl from "mapbox-gl";
import * as h3 from "h3-js";
import { SendTopicService } from "@/app/shared/services/core/send-topic.service";
import { TopicLocation } from "../../interfaces/topic-location.interface";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { H3LayerService } from "@/app/features/landing/services/h3-layer.service";
import { MapUtils } from "@/app/features/landing/services/map-utils.service";

@Component({
    selector: "app-pick-location",
    templateUrl: "./pick-location.component.html",
    styleUrl: "./pick-location.component.scss",
})
export class PickLocationComponent {
    private readonly router = inject(Router);
    private readonly createTopicService = inject(SendTopicService);
    private readonly h3LayerService = inject(H3LayerService);
    private readonly sourceId = "search-polygons";

    map: mapboxgl.Map | null = null;
    selectedLocation: TopicLocation | null = null;

    onMapLoaded(map: mapboxgl.Map) {
        this.map = map;
        this.map.on("moveend", this.onFlyEnd);

        MapUtils.addGeoJsonSource({
            id: this.sourceId,
            map: this.map,
            data: {
                type: "FeatureCollection",
                features: [],
            },
        });
        MapUtils.addLineLayer({
            sourceId: this.sourceId,
            layerId: "search-polygons-layer-line",
            map: this.map,
            data: {
                "line-color": "#5e00cc",
                "line-width": 2,
                "line-opacity": 0.25,
            },
        });
        MapUtils.addFillLayer({
            sourceId: this.sourceId,
            layerId: "search-polygons-layer-fill",
            map: this.map,
            data: {
                "fill-color": "#5e00cc",
                "fill-opacity": 0.15,
            },
        });
    }

    onLocationSelected(location: TopicLocation) {
        this.map?.flyTo({
            center: [location.lng, location.lat],
            zoom: 10,
        });
        this.selectedLocation = location;
    }

    onConfirmLocation() {
        if (this.selectedLocation) {
            this.createTopicService.setTopicLocation(this.selectedLocation);
            this.router.navigateByUrl("/" + AppRoutes.User.Topic.SUGGEST);
        }
    }

    private onFlyEnd = () => {
        if (this.map) {
            const center = this.map.getCenter();
            const h3Index = h3.geoToH3(center.lat, center.lng, 6);
            this.h3LayerService.addH3PolygonsToMap({
                map: this.map,
                h3Indexes: [h3Index],
                sourceId: this.sourceId,
            });
        }
    };
}
