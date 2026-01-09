import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { IGeolocationPositionCoords } from "../../interfaces";

interface IMarkerSizingCfg {
    min?: number;
    base?: number;
    scale?: number;
    max?: number;
}

interface IMarkerSizingOverride {
    globe?: IMarkerSizingCfg;
    mercator?: IMarkerSizingCfg;
}

interface IDevSettings {
    mockLocation?: IGeolocationPositionCoords;
    markerSizingOverride?: IMarkerSizingOverride | null;
}

@Injectable({
    providedIn: "root",
})
export class DevSettingsService {
    private settings: IDevSettings = {};
    private _showDevMenu = true;
    private _markerSizingOverride: IMarkerSizingOverride | null = null;
    private readonly _markerSizingOverride$ = new BehaviorSubject<IMarkerSizingOverride | null>(null);

    get mockLocation(): IGeolocationPositionCoords | null {
        return this.settings.mockLocation || null;
    }

    set mockLocation(mockLocation: IGeolocationPositionCoords) {
        this.settings.mockLocation = mockLocation;
    }

    get showDevMenu(): boolean {
        return this._showDevMenu;
    }

    set showDevMenu(value: boolean) {
        this._showDevMenu = !!value;
    }

    get markerSizingOverride(): IMarkerSizingOverride | null {
        return this._markerSizingOverride;
    }

    set markerSizingOverride(value: IMarkerSizingOverride | null) {
        this._markerSizingOverride = value;
        this._markerSizingOverride$.next(value);
    }

    /** Observable stream of marker sizing overrides (hot) */
    get markerSizingOverride$() {
        return this._markerSizingOverride$.asObservable();
    }
}
