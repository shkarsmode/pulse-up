import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, catchError, map, Observable, switchMap, throwError } from "rxjs";
import { GeocodeService } from "../api/geocode.service";
import { IGeolocation, IGeolocationPosition } from "../../interfaces";
import { DevSettingsService } from "./dev-settings.service";
import { environment } from "@/environments/environment";

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
    private statusSubject = new BehaviorSubject<GeolocationStatus>("initial");
    public status$ = this.statusSubject.asObservable();

    public isSupported = "geolocation" in navigator;
    public geolocation: IGeolocation | null = null;

    get isDev() {
        return environment.production === false;
    }

    getCurrentGeolocation(options?: GetCurrentGeolocationOptions): Observable<IGeolocation> {
        console.log("Geolocation service getCurrentGeolocation called", options);
        console.log({ isSupported: this.isSupported, isDev: this.isDev });

        const { enableHighAccuracy = true } = options || {};

        if (!this.isSupported) {
            this.statusSubject.next("error");
            return new Observable((observer) => {
                observer.error(new Error("Your browser doesn’t support geolocation"));
            });
        }

        // if (this.geolocation) {
        //     return new Observable((observer) => {
        //         observer.next(this.geolocation!);
        //         observer.complete();
        //     });
        // }

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
                    console.log({ position });
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
                    catchError((error) => {
                        console.log("Geolocation service error:", error);

                        this.statusSubject.next("error");
                        return throwError(() => new Error("Failed to retrieve location details."));
                    }),
                );
            }),
        );
    }
}
