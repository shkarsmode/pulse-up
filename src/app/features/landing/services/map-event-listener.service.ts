import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class MapEventListenerService {
    private _selectedCoordinates: { lat: number, lng: number } | null = null;

    get selectedCoordinates() {
        const coords = this._selectedCoordinates;
        this._selectedCoordinates = null;
        return coords;
    }

    onMapClick({ coordinates }: { coordinates: { lat: number, lng: number } }) {
        this._selectedCoordinates = {
            lat: coordinates.lat,
            lng: coordinates.lng,
        };
    }
}