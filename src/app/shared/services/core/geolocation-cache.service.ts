import { Injectable } from "@angular/core";
import { IGeolocation } from "../../interfaces";
import { LOCAL_STORAGE_KEYS, LocalStorageService } from "./local-storage.service";

@Injectable({
    providedIn: "root",
})
export class GeolocationCacheService {
    private geolocationCache: IGeolocation | null = null;
    private timestamp: number | null = null;
    private readonly expiryTime = 1000 * 60 * 60; // 1 hour
    private readonly storageKey = LOCAL_STORAGE_KEYS.geolocationCache;

    constructor() {
        this.syncWithStorage();
    }

    public get(): IGeolocation | null {
        if (this.isExpired()) {
            this.clear();
        }
        return this.geolocationCache;
    }

    public save(geolocation: IGeolocation) {
        this.geolocationCache = geolocation;
        this.timestamp = Date.now();
        this.saveToStorage();
    }

    public clear() {
        this.geolocationCache = null;
        this.timestamp = null;
        this.removeFromStorage();
    }

    private isExpired(): boolean {
        return !!this.timestamp && Date.now() - this.timestamp > this.expiryTime;
    }

    private syncWithStorage() {
        const storedData = LocalStorageService.get<{
            geolocation: IGeolocation;
            timestamp: number;
        }>(this.storageKey);
        if (storedData) {
            this.geolocationCache = storedData.geolocation;
            this.timestamp = storedData.timestamp;
        }
    }

    private saveToStorage() {
        if (this.geolocationCache && this.timestamp) {
            LocalStorageService.set(this.storageKey, {
                geolocation: this.geolocationCache,
                timestamp: this.timestamp,
            });
        }
    }

    private removeFromStorage() {
        LocalStorageService.remove(this.storageKey);
    }
}
