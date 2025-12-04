import { isPlatformBrowser } from "@angular/common";
import { Injectable, PLATFORM_ID, inject } from "@angular/core";

@Injectable({
    providedIn: "root"
})
export class H3Service {
    private readonly platformId = inject(PLATFORM_ID);
    private h3ModulePromise?: Promise<typeof import("h3-js")>;

    private loadH3Module(): Promise<typeof import("h3-js")> {
        if (!this.h3ModulePromise) {
            this.h3ModulePromise = import("h3-js");
        }

        return this.h3ModulePromise;
    }

    public async geoToH3Index(
        latitude: number,
        longitude: number,
        resolution: number
    ): Promise<string | null> {
        if (!isPlatformBrowser(this.platformId)) {
            return null;
        }

        const h3Module = await this.loadH3Module();

        return h3Module.geoToH3(latitude, longitude, resolution);
    }

    public async h3ToGeoBoundary(
        h3Index: string
    ): Promise<any> {
        if (!isPlatformBrowser(this.platformId)) {
            return [];
        }

        const h3Module = await this.loadH3Module();

        return h3Module.h3ToGeoBoundary(h3Index, true);
    }

    public async h3ToGeo(
        h3Index: string
    ): Promise<any> {
        if (!isPlatformBrowser(this.platformId)) {
            return null;
        }

        const h3Module = await this.loadH3Module();

        return h3Module.h3ToGeo(h3Index);
    }
}
