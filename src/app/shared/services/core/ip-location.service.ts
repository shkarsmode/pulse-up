import { inject, Injectable } from "@angular/core";
import { Observable, shareReplay } from "rxjs";
import { IP_INFO_API_TOKEN, MAPBOX_ACCESS_TOKEN } from "../../tokens/tokens";
import { IIpInfo } from "../../interfaces/ip-info/ip-info.interface";
import { ILocationCoordinates } from "../../interfaces/location/location-coordinates.interface";
import { MapboxFeature, MapboxFeatureCollection } from "../../interfaces";


@Injectable({
    providedIn: "root",
})
export class IpLocationService {
    private ipInfoApiToken = inject(IP_INFO_API_TOKEN);
    private mapboxToken = inject(MAPBOX_ACCESS_TOKEN);

    private readonly ipInfoUrl = "https://api.ipinfo.io/lite/";

    public countryCoordinates$ = new Observable<ILocationCoordinates>((observer) => {
        this.getMapboxFeatureFromIp()
            .then((feature) => {
                observer.next({
                    longitude: feature.geometry.coordinates[0],
                    latitude: feature.geometry.coordinates[1]
                });
                observer.complete();
            })
            .catch((error) => {
                observer.error(error);
            });
    }).pipe(shareReplay({ bufferSize: 1, refCount: true }));

    public countryName$ = new Observable<string>((observer) => {
        this.getMapboxFeatureFromIp()
            .then((feature) => {
                observer.next(feature.place_name);
                observer.complete();
            })
            .catch((error) => {
                observer.error(error);
            });
    }).pipe(shareReplay({ bufferSize: 1, refCount: true }));

    private getMapboxFeatureFromIp(): Promise<MapboxFeature> {
        return new Promise((resolve, reject) => {
            fetch(`${this.ipInfoUrl}/me?token=${this.ipInfoApiToken}`)
                .then((response) => response.json())
                .then(({ country }: IIpInfo) => country)
                .then((country) => {
                    return fetch(
                        `https://api.mapbox.com/geocoding/v5/mapbox.places/${country}.json/?types=country&access_token=${this.mapboxToken}`,
                    );
                })
                .then((response) => response.json() as Promise<MapboxFeatureCollection>)
                .then((json) => {
                    const features = json?.features[0];
                    resolve(features);
                })
                .catch((error) => reject(error));
        });
    }
}
