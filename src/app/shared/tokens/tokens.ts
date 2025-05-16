import { InjectionToken } from "@angular/core";
import { IFirebaseConfig } from "../interfaces";

export const MAPBOX_ACCESS_TOKEN: InjectionToken<string> = new InjectionToken(
    'mapboxAccessToken'
);
export const MAPBOX_STYLE: InjectionToken<string> = new InjectionToken(
    'mapboxStyle'
);

export const API_URL: InjectionToken<string> = new InjectionToken(
    'apiUrl'
);


export const FIREBASE_CONFIG: InjectionToken<IFirebaseConfig> = new InjectionToken(
    'fireBaseConfig'
);