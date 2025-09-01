import { InjectionToken } from "@angular/core";
import { IFirebaseConfig } from "../interfaces";

export const MAPBOX_ACCESS_TOKEN = new InjectionToken<string>(
    'mapboxAccessToken'
);
export const MAPBOX_STYLE = new InjectionToken<string>(
    'mapboxStyle'
);

export const API_URL = new InjectionToken<string>(
    'apiUrl'
);

export const GEOCODE_API_URL = new InjectionToken<string>(
    'geocodeApiUrl'
);

export const FIREBASE_CONFIG = new InjectionToken<IFirebaseConfig>(
    'fireBaseConfig'
);

export const IP_INFO_API_TOKEN = new InjectionToken<string>(
    'ipInfoApiToken'
);
