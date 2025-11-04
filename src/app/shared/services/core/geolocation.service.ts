import { environment } from "@/environments/environment";
import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, firstValueFrom } from "rxjs";
import { IGeolocation, IGeolocationPosition } from "../../interfaces";
import { GeocodeService } from "../api/geocode.service";
import { DevSettingsService } from "./dev-settings.service";
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

        const cachedGeolocation = this.geolocationCacheService.get();
        if (cachedGeolocation) {
            this.statusSubject.next("success");
            return cachedGeolocation;
        }

        this.statusSubject.next("pending");

        let lastError: unknown = null;

        for (let attempt = 1; attempt <= 3; attempt++) {
            console.log(`Geolocation attempt ${attempt}...`);
            
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

                            if (enableHighAccuracy && accuracy > 7000) {
                                return reject(new Error("Geolocation accuracy is too low"));
                            }

                            resolve({
                                coords: { latitude, longitude, accuracy },
                            });
                        },
                        (error: GeolocationPositionError) => {
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
                            timeout: 20000,
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
                this.statusSubject.next("success");

                // 3. Save to cache
                this.geolocationCacheService.save(result);

                return result;
            } catch (error: unknown) {
                console.warn(`Geolocation attempt ${attempt} failed:`, error);
                lastError = error;

                if (attempt < 3) {
                    await new Promise((res) => setTimeout(res, 1000));
                }
            }
        }

        this.statusSubject.next("error");
        throw lastError instanceof Error
            ? lastError
            : new Error("Failed to retrieve location details.");
    }

    checkGeolocationPermission(): boolean {
        if (!this.isSupported) {
            return false;
        }

        const cachedGeolocation = this.geolocationCacheService.get();
        if (cachedGeolocation) {
            return true;
        }
        
        return false;
    }
}
