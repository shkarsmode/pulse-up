import { provideHttpClient, withFetch, withInterceptors } from "@angular/common/http";
import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { provideRouter, withInMemoryScrolling } from "@angular/router";
import {
    popperVariation,
    provideTippyConfig,
    provideTippyLoader,
    tooltipVariation
} from "@ngneat/helipopper/config";
import { provideTanStackQuery, QueryClient } from "@tanstack/angular-query-experimental";
import { provideAngularSvgIcon } from "angular-svg-icon";
import { provideCharts, withDefaultRegisterables } from "ng2-charts";

import { environment } from "../environments/environment";
import { APP_ROUTES } from "./app.routes";
import { errorInterceptor } from "./shared/helpers/interceptors/error.interceptor";
import { jwtInterceptor } from "./shared/helpers/interceptors/jwt.interceptor";
import { WindowService } from "./shared/services/core/window.service";
import {
    API_URL,
    FIREBASE_CONFIG,
    GEOCODING_API_URL,
    IP_INFO_API_TOKEN,
    MAPBOX_ACCESS_TOKEN,
    MAPBOX_STYLE,
    MAPBOX_STYLE_WITH_BACKGROUND
} from "./shared/tokens/tokens";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                console.log({ failureCount, error });

                if (error instanceof Object && "status" in error && (error as any).status === 404) {
                    return false;
                }

                return failureCount < 3;
            }
        }
    }
});

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(
            APP_ROUTES,
            withInMemoryScrolling({
                scrollPositionRestoration: "enabled"
            })
        ),
        provideHttpClient(
            withFetch(),
            withInterceptors([jwtInterceptor, errorInterceptor])
        ),
        provideTanStackQuery(queryClient),
        provideAngularSvgIcon(),
        provideAnimationsAsync(),
        provideTippyLoader(() => import("tippy.js")),
        provideTippyConfig({
            defaultVariation: "tooltip",
            variations: {
                tooltip: tooltipVariation,
                popper: popperVariation
            }
        }),
        provideCharts(withDefaultRegisterables()),
        {
            provide: API_URL,
            useValue: environment.apiUrl
        },
        {
            provide: GEOCODING_API_URL,
            useValue: environment.geocodingApiUrl
        },
        {
            provide: MAPBOX_ACCESS_TOKEN,
            useValue: environment.mapboxToken
        },
        {
            provide: MAPBOX_STYLE,
            useValue: environment.mapStyleUrl
        },
        {
            provide: MAPBOX_STYLE_WITH_BACKGROUND,
            useValue: environment.mapWithBackgroundStyleUrl
        },
        {
            provide: FIREBASE_CONFIG,
            useValue: environment.firebaseConfig
        },
        {
            provide: IP_INFO_API_TOKEN,
            useValue: environment.ipInfoApiToken
        },
        WindowService,
        // provideClientHydration()
    ]
};
