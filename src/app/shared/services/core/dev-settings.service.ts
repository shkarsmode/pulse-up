import { Injectable } from "@angular/core";
import { IGeolocationPositionCoords } from "../../interfaces";

interface IDevSettings {
    mockLocation?: IGeolocationPositionCoords;
}

@Injectable({
    providedIn: "root",
})
export class DevSettingsService {
    private settings: IDevSettings = {};

    get mockLocation(): IGeolocationPositionCoords | null {
        return this.settings.mockLocation || null;
    }

    set mockLocation(mockLocation: IGeolocationPositionCoords) {
        this.settings.mockLocation = mockLocation;
    }
}
