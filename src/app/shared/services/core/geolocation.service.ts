import { inject, Injectable } from "@angular/core";
import {
    BehaviorSubject,
    catchError,
    firstValueFrom,
    map,
    Observable,
    switchMap,
    tap,
    throwError,
} from "rxjs";
import { GeocodeService } from "../api/geocode.service";
import { IGeolocation, IGeolocationPosition } from "../../interfaces";
import { DevSettingsService } from "./dev-settings.service";
import { environment } from "@/environments/environment";
import { GeolocationCacheService } from "./geolocation-cache.service";

type GeolocationStatus = "initial" | "pending" | "success" | "error";

interface GetCurrentGeolocationOptions {
    enableHighAccuracy?: boolean;
}

@Injectable({
    providedIn: "root",
})
export class GeolocationService {
    private geocodeService = inject(GeocodeService);
    private devSettingsService = inject(DevSettingsService);
    private geolocationCacheService = inject(GeolocationCacheService);
    private statusSubject = new BehaviorSubject<GeolocationStatus>("initial");
    public status$ = this.statusSubject.asObservable();

    public isSupported = "geolocation" in navigator;
    public geolocation: IGeolocation | null = null;

    get isDev() {
        return environment.production === false;
    }

    async getCurrentGeolocationAsync(
        options?: GetCurrentGeolocationOptions,
    ): Promise<IGeolocation> {
        const { enableHighAccuracy = true } = options || {};

        if (!this.isSupported) {
            this.statusSubject.next("error");
            throw new Error("Your browser doesn’t support geolocation");
        }

        this.statusSubject.next("pending");

        try {
            // 1. Get position
            const position: IGeolocationPosition = await new Promise((resolve, reject) => {
                if (this.isDev) {
                    const mockLocation = this.devSettingsService.mockLocation;
                    if (mockLocation) {
                        return resolve({ coords: mockLocation });
                    }
                }

                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const { latitude, longitude, accuracy } = pos.coords;

                        if (enableHighAccuracy && accuracy > 250) {
                            this.statusSubject.next("error");
                            return reject(new Error("Geolocation accuracy is too low"));
                        }

                        resolve({
                            coords: { latitude, longitude, accuracy },
                        });
                    },
                    (error: GeolocationPositionError) => {
                        this.statusSubject.next("error");
                        switch (error.code) {
                            case 1:
                                reject(new Error("Geolocation permission denied"));
                                break;
                            case 2:
                                reject(new Error("Geolocation position unavailable"));
                                break;
                            case 3:
                                reject(new Error("Retrieving position timed out"));
                                break;
                            default:
                                reject(new Error("Unknown geolocation error"));
                                break;
                        }
                    },
                    {
                        enableHighAccuracy,
                        timeout: 60000,
                        maximumAge: 60 * 1000,
                    },
                );
            });

            // 2. Reverse geocode
            const { latitude, longitude } = position.coords;
            const place = await firstValueFrom(
                this.geocodeService.getPlaceByCoordinates(longitude, latitude),
            );

            const result: IGeolocation = {
                geolocationPosition: position,
                details: place,
            };

            this.geolocation = result;
            this.statusSubject.next("success");

            // 3. Save to cache
            this.geolocationCacheService.save(result);

            return result;
        } catch (error: unknown) {
            console.error("Geolocation service error:", error);
            this.statusSubject.next("error");
            throw new Error("Failed to retrieve location details.");
        }
    }

    getCurrentGeolocation(options?: GetCurrentGeolocationOptions): Observable<IGeolocation> {
        const { enableHighAccuracy = true } = options || {};

        if (!this.isSupported) {
            this.statusSubject.next("error");
            return new Observable((observer) => {
                observer.error(new Error("Your browser doesn’t support geolocation"));
            });
        }

        this.statusSubject.next("pending");

        const geolocationPosition$ = new Observable<IGeolocationPosition>((observer) => {
            if (this.isDev) {
                const mockLocation = this.devSettingsService.mockLocation;
                if (mockLocation) {
                    const position: IGeolocationPosition = {
                        coords: mockLocation,
                    };
                    observer.next(position);
                    observer.complete();
                    return;
                }
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const accuracy = position.coords.accuracy;
                    if (enableHighAccuracy && accuracy > 100) {
                        this.statusSubject.next("error");
                        observer.error(new Error("Geolocation accuracy is too low"));
                        return;
                    }
                    observer.next({
                        coords: {
                            accuracy: position.coords.accuracy,
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        },
                    });
                    observer.complete();
                },
                (error: GeolocationPositionError) => {
                    console.log("Geolocation service error:", error);
                    this.statusSubject.next("error");
                    switch (error.code) {
                        case 1:
                            observer.error(new Error("Geolocation permission denied"));
                            break;
                        case 2:
                            observer.error(new Error("Geolocation position unavailable"));
                            break;
                        case 3:
                            observer.error(new Error("Retrieving position timed out"));
                            break;

                        default:
                            observer.error(new Error("Unknown geolocation error"));
                            break;
                    }
                },
                {
                    enableHighAccuracy,
                    timeout: 60000,
                    maximumAge: 60 * 1000,
                },
            );
        });

        return geolocationPosition$.pipe(
            switchMap((position) => {
                const { latitude, longitude } = position.coords;
                return this.geocodeService.getPlaceByCoordinates(longitude, latitude).pipe(
                    map((place) => {
                        const result: IGeolocation = {
                            geolocationPosition: position,
                            details: place,
                        };
                        this.geolocation = result;
                        this.statusSubject.next("success");
                        return result;
                    }),
                    catchError((error: unknown) => {
                        console.log("Geolocation service error:", error);
                        this.statusSubject.next("error");
                        return throwError(() => new Error("Failed to retrieve location details."));
                    }),
                );
            }),
            tap((geolocation) => {
                this.geolocationCacheService.save(geolocation);
            }),
        );
    }
}
