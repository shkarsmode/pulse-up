import { InjectionToken } from "@angular/core";
import { IFirebaseConfig } from "../interfaces";

export const MAPBOX_ACCESS_TOKEN = new InjectionToken<string>(
    'mapboxAccessToken'
);
export const MAPBOX_STYLE = new InjectionToken<string>(
    'mapboxStyle'
);

export const MAPBOX_STYLE_WITH_BACKGROUND = new InjectionToken<string>(
    'mapboxStyleWithBackground'
)

export const API_URL = new InjectionToken<string>(
    'apiUrl'
);

export const GEOCODING_API_URL = new InjectionToken<string>(
    'geocodingApiUrl'
);

export const FIREBASE_CONFIG = new InjectionToken<IFirebaseConfig>(
    'fireBaseConfig'
);

export const IP_INFO_API_TOKEN = new InjectionToken<string>(
    'ipInfoApiToken'
);
