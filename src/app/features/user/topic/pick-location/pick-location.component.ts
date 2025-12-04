import { H3Service } from '@/app/features/landing/services/h3.service';
import { MapComponent } from "@/app/shared/components/map/map.component";
import { FlatButtonDirective } from "@/app/shared/components/ui-kit/buttons/flat-button/flat-button.directive";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { SpinnerComponent } from "@/app/shared/components/ui-kit/spinner/spinner.component";
import { RippleEffectDirective } from "@/app/shared/directives/ripple-effect";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { GeolocationService } from "@/app/shared/services/core/geolocation.service";
import { MapUtils } from "@/app/shared/services/map/map-utils.service";
import { SendTopicService } from "@/app/shared/services/topic/send-topic.service";
import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { AngularSvgIconModule } from "angular-svg-icon";
import mapboxgl from "mapbox-gl";
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
import { TopicLocation } from "../../interfaces/topic-location.interface";
import { UnavailableGeolocationPopupComponent } from "../../ui/unavailable-geolocation-popup/unavailable-geolocation-popup.component";

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
    private router = inject(Router);
    private dialog = inject(MatDialog);
    private sendTopicService = inject(SendTopicService);
    private geolocationService = inject(GeolocationService);
    private sourceId = "search-polygons";
    private destroy$ = new Subject<void>();
    private h3Service = inject(H3Service);

    private map: mapboxgl.Map | null = null;
    private selectedLocationSubject = new BehaviorSubject(this.sendTopicService.topicLocation);
    private isGeolocationRequestInProgress = new BehaviorSubject<boolean>(false);
    private isMyPositionSelected = new BehaviorSubject(false);
    private isGeolocationSupported = this.geolocationService.isSupported;

    public selectedLocation$ = this.selectedLocationSubject.asObservable();
    public isGeolocationRequestInProgress$ = this.isGeolocationRequestInProgress.asObservable();
    public isMyPositionSelected$ = this.isMyPositionSelected.asObservable();
    public selectedLocationName$ = this.selectedLocationSubject.asObservable().pipe(
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
                    this.isMyPositionSelected.next(true);
                    this.isGeolocationRequestInProgress.next(false);
                },
                error: () => {
                    this.openDialog();
                    this.isMyPositionSelected.next(false);
                    this.isGeolocationRequestInProgress.next(false);
                    this.sendTopicService.startTopicLocationWarningShown = true;
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
        if (!this.map) return;
    
        const center = this.map.getCenter();
    
        this.h3Service.geoToH3Index(center.lat, center.lng, 6)
            .then((h3Index) => {
                if (!h3Index) return;
                this.addPolygonsToMap([h3Index]);
            });
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
        sourceId
    }: {
        map: mapboxgl.Map;
        h3Indexes: string[];
        sourceId?: string;
    }): void {
        (async () => {
            const hexagonFeatures: GeoJSON.Feature<GeoJSON.Polygon>[] = [];
    
            for (const h3Index of h3Indexes) {
                const feature = await this.h3ToPolygonFeature(h3Index);
                if (feature) {
                    hexagonFeatures.push(feature);
                }
            }
    
            MapUtils.setSourceData({
                map,
                sourceId: sourceId || this.sourceId,
                data: {
                    type: "FeatureCollection",
                    features: hexagonFeatures
                }
            });
        })();
    }

    private async h3ToPolygonFeature(
        hex: string
    ): Promise<GeoJSON.Feature<GeoJSON.Polygon> | null> {
        const boundary = await this.h3Service.h3ToGeoBoundary(hex);
    
        if (!boundary.length) {
            return null;
        }
    
        return {
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: [boundary]
            },
            properties: {}
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
