import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { from, Observable } from "rxjs";
import { TopicLocation } from "@/app/features/user/interfaces/topic-location.interface";
import { GEOCODE_API_URL, MAPBOX_ACCESS_TOKEN } from "../../tokens/tokens";
import { MapboxFeature, MapboxFeatureCollection } from "../../interfaces";
import { GeolocationUtils } from "../../helpers/geolocation-utils";

@Injectable({
    providedIn: "root",
})
export class GeocodeService {
    private readonly apiUrl: string = inject(GEOCODE_API_URL);
    private readonly accessToken: string = inject(MAPBOX_ACCESS_TOKEN);
    private readonly http: HttpClient = inject(HttpClient);

    public getPlacesByQuery = (query: string) => {
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
                throw new Error("Failed to fetch places by query.");
            }
            return res.json() as Promise<MapboxFeatureCollection>;
        });

        return from(fetchPromise);
    };

    public getPlaceByCoordinates = (lng: number, lat: number): Observable<TopicLocation> => {
        console.log("getPlaceByCoordinates called with:", lng, lat);
        
        const params = new URLSearchParams({
            access_token: this.accessToken,
            longitude: lng.toString(),
            latitude: lat.toString(),
            limit: "1",
            language: "en",
            types: "country,region,district,place",
        });

        const fetchPromise = fetch(`${this.apiUrl}/reverse?${params}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch place by coordinates.");
                }
                return res.json() as Promise<MapboxFeatureCollection>;
            })
            .then((data) => this.parseMapboxFeature(data.features[0]));

        return from(fetchPromise);
    };

    public parseMapboxFeature = ({ properties, geometry }: MapboxFeature): TopicLocation => {
        return {
            lng: geometry.coordinates[0],
            lat: geometry.coordinates[1],
            city: properties.context.place?.name || "",
            state: properties.context.region?.name || properties.context.district?.name || "",
            country: properties.context.country?.name || "",
            fullname: GeolocationUtils.getLocationFullname({
                country: properties.context.country?.name || "",
                state: properties.context.region?.name || properties.context.district?.name || "",
                city: properties.context.place?.name || "",
            }),
        };
    };
}
