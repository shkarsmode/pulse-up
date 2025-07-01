import { CUSTOM_ELEMENTS_SCHEMA, APP_INITIALIZER, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { AngularSvgIconModule } from "angular-svg-icon";
import { NgxMapboxGLModule } from "ngx-mapbox-gl";
import {
    provideTippyLoader,
    provideTippyConfig,
    tooltipVariation,
    popperVariation,
} from "@ngneat/helipopper/config";

import { environment } from "../environments/environment";
import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app.routing";
import { HeaderComponent } from "./shared/components/header/header.component";
import { LoadingPageComponent } from "./shared/components/loading/loading-page.component";
import { ErrorInterceptor } from "./shared/helpers/interceptors/error.interceptor";
import { MaterialModule } from "./shared/modules/material.module";
import {
    API_URL,
    GEOCODE_API_URL,
    FIREBASE_CONFIG,
    MAPBOX_ACCESS_TOKEN,
    MAPBOX_STYLE,
} from "./shared/tokens/tokens";
import { WindowService } from "./shared/services/core/window.service";
import { JwtInterceptor } from "./shared/helpers/interceptors/jwt.interceptor";
import { ProfileStore } from "./shared/stores/profile.store";

export function initProfileStore(profileStore: ProfileStore) {
    return () => profileStore.init();
}

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MaterialModule,
        HeaderComponent,
        AngularSvgIconModule.forRoot(),
        HttpClientModule,
        LoadingPageComponent,
        NgxMapboxGLModule.withConfig({
            accessToken: environment.mapboxToken,
        }),
    ],
    providers: [
        // provideHttpClient(
        //     withInterceptors([JwtInterceptor, ErrorInterceptor])
        // ) // * must be functions
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
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        {
            provide: APP_INITIALIZER,
            useFactory: initProfileStore,
            deps: [ProfileStore],
            multi: true,
        },
        provideAnimationsAsync(),
        WindowService,
        provideTippyLoader(() => import("tippy.js")),
        provideTippyConfig({
            defaultVariation: "tooltip",
            variations: {
                tooltip: tooltipVariation,
                popper: popperVariation,
            },
        }),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    bootstrap: [AppComponent],
})
export class AppModule {}
