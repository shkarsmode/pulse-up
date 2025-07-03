import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, catchError, map, Observable, switchMap, throwError } from "rxjs";
import { GeocodeService } from "../api/geocode.service";
import { IGeolocation } from "../../interfaces";

type GeolocationStatus = "initial" | "pending" | "success" | "error";

interface GetCurrentGeolocationOptions {
    enableHighAccuracy?: boolean;
}

@Injectable({
    providedIn: "root",
})
export class GeolocationService {
    private geocodeService = inject(GeocodeService);
    private statusSubject = new BehaviorSubject<GeolocationStatus>("initial");
    public status$ = this.statusSubject.asObservable();

    public isSupported = "geolocation" in navigator;
    public geolocation: IGeolocation | null = null;

    getCurrentGeolocation(options?: GetCurrentGeolocationOptions): Observable<IGeolocation> {
        const { enableHighAccuracy = true } = options || {};

        if (!this.isSupported) {
            this.statusSubject.next("error");
            return new Observable((observer) => {
                observer.error(new Error("Geolocation not supported"));
            });
        }

        // if (this.geolocation) {
        //     return new Observable((observer) => {
        //         observer.next(this.geolocation!);
        //         observer.complete();
        //     });
        // }

        this.statusSubject.next("pending");

        const geolocationPosition$ = new Observable<GeolocationPosition>((observer) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const accuracy = position.coords.accuracy;
                    if (enableHighAccuracy && accuracy > 100) {
                        this.statusSubject.next("error");
                        observer.error(new Error("Geolocation accuracy is too low"));
                        return;
                    }
                    observer.next(position);
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
                        this.statusSubject.next("error");
                        return throwError(() => new Error("Failed to retrieve location details."));
                    }),
                );
            }),
        );
    }
}
