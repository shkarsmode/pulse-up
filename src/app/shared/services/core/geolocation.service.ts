import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, catchError, map, Observable, switchMap, throwError } from "rxjs";
import { GeocodeService } from "../api/geocode.service";
import { IGeolocation } from "../../interfaces";

type GeolocationStatus = "initial" | "pending" | "success" | "error";

@Injectable({
    providedIn: "root",
})
export class GeolocationService {
    private geocodeService = inject(GeocodeService);
    private statusSubject = new BehaviorSubject<GeolocationStatus>("initial");
    public status$ = this.statusSubject.asObservable();

    public isSupported = "geolocation" in navigator;
    public geolocation: IGeolocation | null = null;

    getCurrentGeolocation(): Observable<IGeolocation> {
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
                    console.log({ accuracy, position });
                    if (accuracy > 100) {
                        this.statusSubject.next("error");
                        observer.error(new Error("Geolocation accuracy is too low"));
                        return;
                    }
                    observer.next(position);
                    observer.complete();
                },
                (error) => {
                    console.log("Geolocation service error:", error);
                    this.statusSubject.next("error");
                    observer.error(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0,
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
