import { Injectable } from "@angular/core";
import { IGeolocation } from "../../interfaces";
import { LOCAL_STORAGE_KEYS, LocalStorageKey, LocalStorageService } from "./local-storage.service";

interface IGeolocationCacheStoragePayload {
    geolocation: IGeolocation;
    timestamp: number;
}

@Injectable({
    providedIn: "root"
})
export class GeolocationCacheService {
    private cachedGeolocation: IGeolocation | null = null;
    private cachedAtTimestamp: number | null = null;

    private readonly cacheLifetimeMs: number = 60 * 60 * 1000;
    private readonly storageKey: LocalStorageKey = LOCAL_STORAGE_KEYS.geolocationCache;

    constructor() {
        this.syncWithStorage();
    }

    public get(): IGeolocation | null {
        if (this.isExpired()) {
            this.clear();
            return null;
        }

        return this.cachedGeolocation;
    }

    public save(geolocation: IGeolocation): void {
        this.cachedGeolocation = geolocation;
        this.cachedAtTimestamp = Date.now();
        this.saveToStorage();
    }

    public clear(): void {
        this.cachedGeolocation = null;
        this.cachedAtTimestamp = null;
        this.removeFromStorage();
    }

    private isExpired(): boolean {
        if (!this.cachedAtTimestamp) {
            return false;
        }

        const elapsedSinceCacheMs = Date.now() - this.cachedAtTimestamp;
        return elapsedSinceCacheMs > this.cacheLifetimeMs;
    }

    private syncWithStorage(): void {
        const storedData = LocalStorageService.get<IGeolocationCacheStoragePayload>(
            this.storageKey
        );

        if (!storedData) {
            return;
        }

        this.cachedGeolocation = storedData.geolocation;
        this.cachedAtTimestamp = storedData.timestamp;
    }

    private saveToStorage(): void {
        if (!this.cachedGeolocation || !this.cachedAtTimestamp) {
            return;
        }

        const payload: IGeolocationCacheStoragePayload = {
            geolocation: this.cachedGeolocation,
            timestamp: this.cachedAtTimestamp
        };

        LocalStorageService.set(this.storageKey, payload);
    }

    private removeFromStorage(): void {
        LocalStorageService.remove(this.storageKey);
    }
}
