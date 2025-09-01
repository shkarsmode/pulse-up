import { inject, Injectable } from "@angular/core";
import { Observable, shareReplay } from "rxjs";
import { IP_INFO_API_TOKEN, MAPBOX_ACCESS_TOKEN } from "../../tokens/tokens";
import { IIpInfo } from "../../interfaces/ip-info/ip-info.interface";

interface ICoordinates {
    longitude: number;
    latitude: number;
}

@Injectable({
    providedIn: "root",
})
export class IpLocationService {
    private ipInfoApiToken = inject(IP_INFO_API_TOKEN);
    private mapboxToken = inject(MAPBOX_ACCESS_TOKEN);

    private readonly ipInfoUrl = "https://api.ipinfo.io/lite/";

    public coordinates$ = new Observable<ICoordinates>((observer) => {
        this.getCoordinatesFromIp()
            .then((coordinates) => {
                observer.next(coordinates);
                observer.complete();
            })
            .catch((error) => {
                observer.error(error);
            });
    }).pipe(shareReplay({ bufferSize: 1, refCount: true }));

    private getCoordinatesFromIp(): Promise<ICoordinates> {
        return new Promise((resolve, reject) => {
            fetch(`${this.ipInfoUrl}/me?token=${this.ipInfoApiToken}`)
                .then((response) => response.json())
                .then(({ country }: IIpInfo) => country)
                .then((country) => {
                    return fetch(
                        `https://api.mapbox.com/geocoding/v5/mapbox.places/${country}.json/?types=country&access_token=${this.mapboxToken}`,
                    );
                })
                .then((response) => response.json())
                .then((json) => {
                    const coordinates = json?.features[0]?.center;
                    if (coordinates) {
                        const [longitude, latitude] = coordinates;
                        resolve({ longitude, latitude });
                    } else {
                        reject("Location not found");
                    }
                })
                .catch((error) => reject(error));
        });
    }
}
