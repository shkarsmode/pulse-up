import { Injectable } from "@angular/core";
import { IGeolocation } from "../../interfaces";

@Injectable({
    providedIn: "root",
})
export class GeolocationCacheService {
    private geolocationCache: IGeolocation | null = null;
    private timestamp: number | null = null;
    private readonly expiryTime = 1000 * 60 * 60; // 1 hour

    public save(geolocation: IGeolocation) {
        this.geolocationCache = geolocation;
        this.timestamp = Date.now();
    }

    public get(): IGeolocation | null {
        if (this.isExpired()) {
            this.clear();
        }
        return this.geolocationCache;
    }

    public clear() {
        this.geolocationCache = null;
        this.timestamp = null;
    }

    private isExpired(): boolean {
        return !!this.timestamp && Date.now() - this.timestamp > this.expiryTime;
    }
}