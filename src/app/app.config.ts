import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter, withInMemoryScrolling } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { provideAngularSvgIcon } from "angular-svg-icon";
import {
    provideTippyLoader,
    provideTippyConfig,
    tooltipVariation,
    popperVariation,
} from "@ngneat/helipopper/config";
import { provideTanStackQuery, QueryClient } from "@tanstack/angular-query-experimental";
import {
    API_URL,
    FIREBASE_CONFIG,
    GEOCODING_API_URL,
    IP_INFO_API_TOKEN,
    MAPBOX_ACCESS_TOKEN,
    MAPBOX_STYLE,
} from "./shared/tokens/tokens";
import { environment } from "../environments/environment";
import { jwtInterceptor } from "./shared/helpers/interceptors/jwt.interceptor";
import { errorInterceptor } from "./shared/helpers/interceptors/error.interceptor";
import { APP_ROUTES } from "./app.routes";
import { WindowService } from "./shared/services/core/window.service";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                console.log({ failureCount, error });

                if (error instanceof Object && "status" in error && error.status === 404) {
                    return false;
                }
                return failureCount < 3;
            },
        },
    },
});

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(
            APP_ROUTES,
            withInMemoryScrolling({
                scrollPositionRestoration: "enabled",
            }),
        ),
        provideHttpClient(withInterceptors([jwtInterceptor, errorInterceptor])),
        provideTanStackQuery(queryClient),
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
            provide: API_URL,
            useValue: environment.apiUrl,
        },
        {
            provide: GEOCODING_API_URL,
            useValue: environment.geocodingApiUrl,
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
        {
            provide: IP_INFO_API_TOKEN,
            useValue: environment.ipInfoApiToken,
        },
        WindowService,
    ],
};
