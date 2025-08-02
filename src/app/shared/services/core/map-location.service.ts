import { Injectable } from '@angular/core';
import { RectangleCoordinates } from '../../interfaces/reactangle-coords.interface';

@Injectable({
    providedIn: 'root'
})
export class MapLocationService {

      
    public mapLocationFilter = '';
    /**
     * Retrieves/GET the list of public/published vibe counts and their tiles for map by H3 cells
     *
     * @param region Gets or sets latitude (Y)
     */
    public getLocationFilter(region: any, visibleBounds: any[][]) {
        // region.getCurrentPosition();
        const longitude = region.lng;
        const latitude = region.lat;
        const zoomLevel = region.zoom;
        // const visibleBounds = visibleBounds;
        // console.log(visibleBounds);

        fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=pk.eyJ1IjoidmliZXNwb3QiLCJhIjoiY2p4YnN5cHY3MDB3NDN4czVrOWtpanU4aCJ9.nexbisROPDgIPDPUPm5tvQ&types=country,region,district,place,locality,neighborhood`
        )
            .then((response) => response.json())
            .then((data) => {
                if (data.features.length) {
                    const properties: any = {};
                    data.features.map((f: any) => {
                        properties[f.place_type[0]] = f.text;
                    });

                    this.getMapAreaNameMapbox(
                        properties,
                        zoomLevel,
                        data.features,
                        visibleBounds
                    );
                } else {
                    this.mapLocationFilter = 'World';
                }
            })
            .catch((err) => console.log('fetch err - ', err));
    }

    private fetchNativeLocation(region: any): any {
        const longitude = region.geometry.coordinates[0];
        const latitude = region.geometry.coordinates[1];
        const zoomLevel = region.properties.zoomLevel;
        const res = '';
        // const res = this.geocode.geocodePosition({ lat: latitude, lng: longitude });

        // console.log('fetchNativeLocation updateLocationFilter res', res);
        const info = res[0];
        return this.getMapAreaName(info, zoomLevel);
    }

    private getMapAreaName(info: any, zoomLevel: number) {
        // let name = 'Nearby';
        let name;

        if (zoomLevel < 4) {
            name = 'Map Area';
        }

        if (zoomLevel >= 4 && info.country) {
            name = info.country;
        }

        if (zoomLevel >= 8 && info.adminArea) {
            name = info.adminArea;
        }

        if (zoomLevel >= 10 && info.subAdminArea) {
            name = info.subAdminArea;
        }

        if (zoomLevel >= 13 && info.locality) {
            name = info.locality;
        }

        if (zoomLevel >= 15 && info.subLocality) {
            name = info.subLocality;
        }

        if (!name) {
            name = info.feature;
        }

        return name;
    }

    private getMapAreaNameMapbox(
        info: any,
        zoomLevel: number,
        fullInfo: any,
        visibleBounds: any
    ): void {
        let name;
        // console.log(fullInfo);

        if (zoomLevel < 4) {
            name = 'World';
        }

        if (zoomLevel >= 4) {
            const getPercents = (coords: any) => {
                const square =
                    (coords[2] - coords[0]) * (coords[3] - coords[1]);
                // console.log('square ' + square);
                const visibleSquare =
                    (visibleBounds[0][0] - visibleBounds[1][0]) *
                    (visibleBounds[0][1] - visibleBounds[1][1]);
                // console.log(visibleBounds[0][0]);
                // console.log('square / visibleSquare - ', square / visibleSquare);
                return square / visibleSquare;
            };

            let visibleLevel = fullInfo.find(
                (level: any) => level.bbox && getPercents(level.bbox) > 0.7
            );

            visibleLevel = visibleLevel || fullInfo[fullInfo.length - 1];
            // console.log(fullInfo);

            name = visibleLevel.text;
        }
        // console.log('name ' + name);
        this.mapLocationFilter = name;
    }

    public getMapCoordinatesWebClient(map: any): RectangleCoordinates {
        let coordinates: RectangleCoordinates = {};
        const radius = 11220;

        coordinates = {
            lat: map.getCenter().lat,
            lng: map.getCenter().lng,
            latSW: map.getBounds().getSouthWest().lat,
            latNE: map.getBounds().getNorthEast().lat,
            lngSW: map.getBounds().getSouthWest().lng,
            lngNE: map.getBounds().getNorthEast().lng,
            radius: this.getRadius(map.getBounds(), true)
                ? this.getRadius(map.getBounds(), true)
                : radius,
            zoom: map.getZoom(),
        };
        return coordinates;
    }

    public getRadius(bounds: any, mapbox?: boolean): number {
        let a = 0;
        if (bounds) {
            const lat1 = mapbox
                ? bounds.getSouthWest().lat
                : bounds.getSouthWest().lat();
            const lng1 = mapbox
                ? bounds.getSouthWest().lng
                : bounds.getSouthWest().lng();
            const lat2 = mapbox
                ? bounds.getNorthEast().lat
                : bounds.getNorthEast().lat();
            const lng2 = mapbox
                ? bounds.getNorthEast().lng
                : bounds.getNorthEast().lng();

            const p = 0.017453292519943295;
            const c = Math.cos;
            a =
                0.5 -
                c((lat2 - lat1) * p) / 2 +
                (c(lat1 * p) * c(lat2 * p) * (1 - c((lng2 - lng1) * p))) / 2;
        }
        return Math.floor(((12742 * Math.asin(Math.sqrt(a))) / 2) * 1000);
    }


}