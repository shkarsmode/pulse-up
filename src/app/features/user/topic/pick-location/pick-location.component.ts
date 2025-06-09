import { Component, inject, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, catchError, switchMap, tap, throwError } from "rxjs";
import mapboxgl from "mapbox-gl";
import * as h3 from "h3-js";
import { SendTopicService } from "@/app/shared/services/core/send-topic.service";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { H3LayerService } from "@/app/features/landing/services/h3-layer.service";
import { MapUtils } from "@/app/features/landing/services/map-utils.service";
import { GeolocationService } from "@/app/shared/services/core/geolocation.service";
import { NotificationService } from "@/app/shared/services/core/notification.service";
import { TopicLocation } from "../../interfaces/topic-location.interface";
import { GeocodeService } from "@/app/shared/services/api/geocode.service";

@Component({
    selector: "app-pick-location",
    templateUrl: "./pick-location.component.html",
    styleUrl: "./pick-location.component.scss",
})
export class PickLocationComponent implements OnInit {
    private readonly router = inject(Router);
    private readonly sendTopicService = inject(SendTopicService);
    private readonly h3LayerService = inject(H3LayerService);
    private readonly geteocodeService = inject(GeocodeService);
    private readonly geolocationService = inject(GeolocationService);
    private readonly notificationService = inject(NotificationService);
    private readonly sourceId = "search-polygons";

    map: mapboxgl.Map | null = null;
    selectedLocation = this.sendTopicService.customLocation;
    isGeolocationSupported = this.geolocationService.isSupported;
    isGeolocationRequestInProgress = new BehaviorSubject<boolean>(true);
    isGeolocationRequestInProgress$ = this.isGeolocationRequestInProgress.asObservable();

    get isMyPositionSelected() {
        return this.selectedLocation && this.geolocationService.currentPosition;
    }

    ngOnInit(): void {
        if (this.selectedLocation) {
            this.map?.jumpTo({
                center: [this.selectedLocation.lng, this.selectedLocation.lat],
                zoom: 10,
            });
            return;
        }

        if (!this.isGeolocationSupported) return;

        this.getMyPosition();
    }

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
            this.sendTopicService.setTopicLocation(this.selectedLocation);
            this.router.navigateByUrl("/" + AppRoutes.User.Topic.SUGGEST);
        }
    }

    getMyPosition = () => {
        this.isGeolocationRequestInProgress.next(true);
        this.geolocationService
            .getCurrentPosition()
            .pipe(
                catchError((error) => {
                    return throwError(
                        () =>
                            new Error(
                                "Geolocation not available. Please select a location manually.",
                            ),
                    );
                }),
                tap((position) => {
                    const { latitude, longitude } = position.coords;
                    this.map?.jumpTo({
                        center: [longitude, latitude],
                        zoom: 10,
                    });
                }),
                switchMap((position) => {
                    const { latitude, longitude } = position.coords;
                    return this.geteocodeService.getPlaceByCoordinates(longitude, latitude);
                }),
                catchError((error) => {
                    return throwError(
                        () =>
                            new Error(
                                "Failed to retrieve location details. Please select a location manually.",
                            ),
                    );
                }),
            )
            .subscribe({
                next: (place) => {
                    this.selectedLocation = place;
                    this.isGeolocationRequestInProgress.next(false);
                },
                error: (error) => {
                    this.notificationService.error(error.message);
                    this.isGeolocationRequestInProgress.next(false);
                },
            });
    };

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
