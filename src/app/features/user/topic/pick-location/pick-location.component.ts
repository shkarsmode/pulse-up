import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import {
    BehaviorSubject,
    catchError,
    map,
    Subject,
    switchMap,
    take,
    takeUntil,
    tap,
    throwError,
} from "rxjs";
import mapboxgl from "mapbox-gl";
import * as h3 from "h3-js";
import { MatDialog } from "@angular/material/dialog";
import { SendTopicService } from "@/app/shared/services/core/send-topic.service";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { H3LayerService } from "@/app/features/landing/services/h3-layer.service";
import { MapUtils } from "@/app/features/landing/services/map-utils.service";
import { GeolocationService } from "@/app/shared/services/core/geolocation.service";
import { NotificationService } from "@/app/shared/services/core/notification.service";
import { TopicLocation } from "../../interfaces/topic-location.interface";
import { GeocodeService } from "@/app/shared/services/api/geocode.service";
import { UnavailableGeolocationPopupComponent } from "../../ui/unavailable-geolocation-popup/unavailable-geolocation-popup.component";

@Component({
    selector: "app-pick-location",
    templateUrl: "./pick-location.component.html",
    styleUrl: "./pick-location.component.scss",
})
export class PickLocationComponent implements OnInit, OnDestroy {
    private readonly router = inject(Router);
    private dialog = inject(MatDialog);
    private readonly sendTopicService = inject(SendTopicService);
    private readonly h3LayerService = inject(H3LayerService);
    private readonly geteocodeService = inject(GeocodeService);
    private readonly geolocationService = inject(GeolocationService);
    private readonly notificationService = inject(NotificationService);
    private readonly sourceId = "search-polygons";
    private destroy$ = new Subject<void>();

    map: mapboxgl.Map | null = null;
    selectedLocationSubject = new BehaviorSubject(this.sendTopicService.customLocation);
    selectedLocation$ = this.selectedLocationSubject.asObservable();
    isGeolocationSupported = this.geolocationService.isSupported;
    isGeolocationRequestInProgress = new BehaviorSubject<boolean>(false);
    isGeolocationRequestInProgress$ = this.isGeolocationRequestInProgress.asObservable();
    isMyPositionSelected$ = this.selectedLocationSubject
        .asObservable()
        .pipe(map((location) => !!(location && this.geolocationService.currentPosition)));
    selectedLocationName$ = this.selectedLocationSubject.asObservable().pipe(
        map((location) => {
            if (!location) return "";
            const { city, state, country } = location;
            return [city, state, country].filter(Boolean).join(", ");
        }),
    );

    ngOnInit(): void {
        if (this.selectedLocationSubject.value || !this.isGeolocationSupported) return;
        this.getMyPosition();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onMapLoaded(map: mapboxgl.Map) {
        this.map = map;
        this.map.on("moveend", this.onFlyEnd);
        this.addLayersToMap();
        this.jumpToSelectedLocation();
    }

    onLocationSelected(location: TopicLocation | null) {
        if (!this.map) return;

        this.selectedLocationSubject.next(location);

        if (location) {
            this.map?.flyTo({
                center: [location.lng, location.lat],
                zoom: 10,
            });
        } else {
            this.removePolygonsFromMap();
        }
    }

    onConfirmLocation() {
        if (this.selectedLocationSubject.value) {
            this.sendTopicService.setTopicLocation(this.selectedLocationSubject.value);
            this.router.navigateByUrl("/" + AppRoutes.User.Topic.SUGGEST, {
                replaceUrl: true,
            });
        }
    }

    getMyPosition = () => {
        this.isGeolocationRequestInProgress.next(true);
        this.geolocationService
            .getCurrentPosition()
            .pipe(
                takeUntil(this.destroy$),
                catchError((error) => {
                    return throwError(() => new Error("Geolocation not available."));
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
                    return this.geteocodeService.getPlaceByCoordinates(longitude, latitude).pipe(
                        catchError((error) => {
                            return throwError(
                                () => new Error("Failed to retrieve location details."),
                            );
                        }),
                    );
                }),
            )
            .subscribe({
                next: (place) => {
                    this.selectedLocationSubject.next(place);
                    this.isGeolocationRequestInProgress.next(false);
                },
                error: (error) => {
                    this.openDialog();
                    this.isGeolocationRequestInProgress.next(false);
                    this.sendTopicService.startTopicLocatoinWarningShown = true;
                },
            });
    };

    private addLayersToMap() {
        if (!this.map) return;
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

    private onFlyEnd = () => {
        if (this.map) {
            const center = this.map.getCenter();
            const h3Index = h3.geoToH3(center.lat, center.lng, 6);
            this.addPolygonsToMap([h3Index]);
        }
    };

    private jumpToSelectedLocation() {
        if (!this.selectedLocationSubject.value || !this.map) return;
        this.map?.jumpTo({
            center: [
                this.selectedLocationSubject.value.lng,
                this.selectedLocationSubject.value.lat,
            ],
            zoom: 10,
        });
    }

    private addPolygonsToMap(h3Indexes: string[]) {
        if (!this.map) return;
        this.h3LayerService.addH3PolygonsToMap({
            map: this.map,
            h3Indexes: h3Indexes,
            sourceId: this.sourceId,
        });
    }

    private removePolygonsFromMap() {
        if (!this.map) return;
        this.h3LayerService.addH3PolygonsToMap({
            map: this.map,
            h3Indexes: [],
            sourceId: this.sourceId,
        });
    }

    private openDialog() {
        const dialogRef = this.dialog.open(UnavailableGeolocationPopupComponent, {
            width: "630px",
            panelClass: "custom-dialog-container",
            backdropClass: "custom-dialog-backdrop",
            disableClose: true,
        });
        dialogRef
            .afterClosed()
            .pipe(take(1))
            .subscribe((result) => {
                if (result === "continue") {
                    this.router.navigateByUrl("/" + AppRoutes.User.Topic.SUGGEST);
                }
            });
    }
}
