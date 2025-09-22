import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import {
    BehaviorSubject,
    catchError,
    from,
    map,
    Subject,
    take,
    takeUntil,
    tap,
    throwError,
} from "rxjs";
import mapboxgl from "mapbox-gl";
import * as h3 from "h3-js";
import { MatDialog } from "@angular/material/dialog";
import { SendTopicService } from "@/app/shared/services/topic/send-topic.service";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { MapUtils } from "@/app/shared/services/map/map-utils.service";
import { GeolocationService } from "@/app/shared/services/core/geolocation.service";
import { TopicLocation } from "../../interfaces/topic-location.interface";
import { UnavailableGeolocationPopupComponent } from "../../ui/unavailable-geolocation-popup/unavailable-geolocation-popup.component";
import { MapComponent } from "@/app/shared/components/map/map.component";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { AngularSvgIconModule } from "angular-svg-icon";
import { SpinnerComponent } from "@/app/shared/components/ui-kit/spinner/spinner.component";
import { FlatButtonDirective } from "@/app/shared/components/ui-kit/buttons/flat-button/flat-button.directive";
import { RippleEffectDirective } from "@/app/shared/directives/ripple-effect";

@Component({
    selector: "app-pick-location",
    templateUrl: "./pick-location.component.html",
    styleUrl: "./pick-location.component.scss",
    standalone: true,
    imports: [
        CommonModule,
        MapComponent,
        PrimaryButtonComponent,
        AngularSvgIconModule,
        SpinnerComponent,
        FlatButtonDirective,
        RippleEffectDirective,
    ],
})
export class PickLocationComponent implements OnInit, OnDestroy {
    private readonly router = inject(Router);
    private dialog = inject(MatDialog);
    private readonly sendTopicService = inject(SendTopicService);
    private readonly geolocationService = inject(GeolocationService);
    private readonly sourceId = "search-polygons";
    private destroy$ = new Subject<void>();

    map: mapboxgl.Map | null = null;
    selectedLocationSubject = new BehaviorSubject(this.sendTopicService.topicLocation);
    selectedLocation$ = this.selectedLocationSubject.asObservable();
    isGeolocationSupported = this.geolocationService.isSupported;
    isGeolocationRequestInProgress = new BehaviorSubject<boolean>(false);
    isGeolocationRequestInProgress$ = this.isGeolocationRequestInProgress.asObservable();
    isMyPositionSelected$ = this.selectedLocationSubject
        .asObservable()
        .pipe(map((location) => !!(location && this.geolocationService.geolocation)));
    selectedLocationName$ = this.selectedLocationSubject.asObservable().pipe(
        map((location) => {
            if (!location) return "";
            return location.fullname;
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
        from(this.geolocationService.getCurrentGeolocationAsync({enableHighAccuracy: false}))
            .pipe(
                catchError(() => {
                    return throwError(() => new Error("Geolocation not available."));
                }),
                tap((geolocation) => {
                    console.log("Geolocation retrieved:", geolocation);
                    
                    const { latitude, longitude } = geolocation.geolocationPosition.coords;
                    this.map?.jumpTo({
                        center: [longitude, latitude],
                        zoom: 10,
                    });
                }),
                takeUntil(this.destroy$),
            )
            .subscribe({
                next: (geolocation) => {
                    this.selectedLocationSubject.next(geolocation.details);
                    this.isGeolocationRequestInProgress.next(false);
                },
                error: () => {
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
        this.addH3PolygonsToMap({
            map: this.map,
            h3Indexes: h3Indexes,
            sourceId: this.sourceId,
        });
    }

    private removePolygonsFromMap() {
        if (!this.map) return;
        this.addH3PolygonsToMap({
            map: this.map,
            h3Indexes: [],
            sourceId: this.sourceId,
        });
    }

    private addH3PolygonsToMap({
        map,
        h3Indexes,
        sourceId,
    }: {
        map: mapboxgl.Map;
        h3Indexes: string[];
        sourceId?: string;
    }): void {
        const hexagons = h3Indexes.filter(
            (h3Index) => !MapUtils.isHexagonCrossesAntimeridian(h3Index),
        );
        const hexagonFeatures = hexagons.map((hex) => this.h3ToPolygonFeature(hex));
        MapUtils.setSourceData({
            map,
            sourceId: sourceId || this.sourceId,
            data: {
                type: "FeatureCollection",
                features: hexagonFeatures,
            },
        });
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
