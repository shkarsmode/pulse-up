import { inject, Injectable } from "@angular/core";
import { GEOCODING_API_URL, MAPBOX_ACCESS_TOKEN } from "../../tokens/tokens";
import { MapboxFeatureCollection } from "../../interfaces";

@Injectable({
    providedIn: "root",
})
export class MapboxPlacesService {
    private geocodingApiUrl = inject(GEOCODING_API_URL);
    private mapboxToken = inject(MAPBOX_ACCESS_TOKEN);

    public async reverse({
        longitude,
        latitude,
    }: {
        longitude: number;
        latitude: number;
    }): Promise<MapboxFeatureCollection> {
        try {
            
            const response = await fetch(
                `${this.geocodingApiUrl}/mapbox.places/${longitude},${latitude}.json/?types=country,region,district,place&access_token=${this.mapboxToken}`,
            );
            const json = await response.json();
            return json;
        } catch (error) {
            console.error("Error fetching Mapbox place:", error);
            throw error;
        }
    }
}
