import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

type GeolocationStatus = "initial" | "pending" | "success" | "error";

@Injectable({
    providedIn: "root",
})
export class GeolocationService {
    private statusSubject = new BehaviorSubject<GeolocationStatus>("initial");
    public status$ = this.statusSubject.asObservable();

    public isSupported = "geolocation" in navigator;
    public currentPosition: GeolocationPosition | null = null;

    getCurrentPosition(): Observable<GeolocationPosition> {
        if (!this.isSupported) {
            this.statusSubject.next("error");
            return new Observable((observer) => {
                observer.error(new Error("Geolocation not supported"));
            });
        }

        if (this.currentPosition) {
            return new Observable((observer) => {
                observer.next(this.currentPosition!);
                observer.complete();
            });
        }

        this.statusSubject.next("pending");

        return new Observable<GeolocationPosition>((observer) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.currentPosition = position;
                    this.statusSubject.next("success");
                    observer.next(position);
                    observer.complete();
                },
                (error) => {
                    this.statusSubject.next("error");
                    observer.error(error);
                },
                {
                    enableHighAccuracy: false,
                    timeout: 15000,
                    maximumAge: 0,
                }
            );
        });
    }
}
