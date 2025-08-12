import {
    APP_INITIALIZER,
    ApplicationConfig,
    provideZoneChangeDetection,
} from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { provideAngularSvgIcon } from "angular-svg-icon";
import {
    provideTippyLoader,
    provideTippyConfig,
    tooltipVariation,
    popperVariation,
} from "@ngneat/helipopper/config";
import {
    API_URL,
    FIREBASE_CONFIG,
    GEOCODE_API_URL,
    MAPBOX_ACCESS_TOKEN,
    MAPBOX_STYLE,
} from "./shared/tokens/tokens";
import { environment } from "../environments/environment";
import { jwtInterceptor } from "./shared/helpers/interceptors/jwt.interceptor";
import { errorInterceptor } from "./shared/helpers/interceptors/error.interceptor";
import { APP_ROUTES } from "./app.routes";
import { WindowService } from "./shared/services/core/window.service";
import { SettingsService } from "./shared/services/api/settings.service";

function initializeApp(settingsService: SettingsService) {
    return () => settingsService.settings$;
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(APP_ROUTES),
        provideHttpClient(withInterceptors([jwtInterceptor, errorInterceptor])),
        provideAngularSvgIcon(),
        provideAnimationsAsync(),
        provideTippyLoader(() => import("tippy.js")),
        provideTippyConfig({
            defaultVariation: "tooltip",
            variations: {
                tooltip: tooltipVariation,
                popper: popperVariation,
            },
        }),
        {
            provide: APP_INITIALIZER,
            useFactory: initializeApp,
            deps: [SettingsService],
            multi: true,
        },
        {
            provide: API_URL,
            useValue: environment.apiUrl,
        },
        {
            provide: GEOCODE_API_URL,
            useValue: environment.geocodeApiUrl,
        },
        {
            provide: MAPBOX_ACCESS_TOKEN,
            useValue: environment.mapboxToken,
        },
        {
            provide: MAPBOX_STYLE,
            useValue: environment.mapStyleUrl,
        },
        {
            provide: FIREBASE_CONFIG,
            useValue: environment.firebaseConfig,
        },
        WindowService,
    ],
};
