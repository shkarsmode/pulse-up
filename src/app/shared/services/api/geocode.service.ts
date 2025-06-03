import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { GEOCODE_API_URL, MAPBOX_ACCESS_TOKEN } from "../../tokens/tokens";
import { MapboxFeatureCollection } from "../../interfaces";
import { from, of } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class GeocodeService {
    private readonly apiUrl: string = inject(GEOCODE_API_URL);
    private readonly accessToken: string = inject(MAPBOX_ACCESS_TOKEN);
    private readonly http: HttpClient = inject(HttpClient);

    public getPlaces = (query: string) => {
        const params = new URLSearchParams({
            q: query,
            access_token: this.accessToken,
            limit: "5",
            types: "country,region,district,place",
            language: "en",
            autocomplete: "true",
        }).toString();

        const fetchPromise = fetch(`${this.apiUrl}/forward?${params}`).then((res) => {
            if (!res.ok) {
                throw new Error(`Fetch failed with status ${res.status}`);
            }
            return res.json() as Promise<MapboxFeatureCollection>;
        });

        return from(fetchPromise);
    };
}
