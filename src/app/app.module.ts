import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';

import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';
import { HeaderComponent } from './shared/components/header/header.component';
import { LoadingPageComponent } from './shared/components/loading/loading-page.component';
import { ErrorInterceptor } from './shared/helpers/interceptors/error.interceptor';
import { MaterialModule } from './shared/modules/material.module';
import { API_URL, FIREBASE_CONFIG, MAPBOX_ACCESS_TOKEN, MAPBOX_STYLE, MAPBOX_WITH_BACKGROUND_STYLE } from './shared/tokens/tokens';

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
            provide: MAPBOX_ACCESS_TOKEN,
            useValue: environment.mapboxToken,
        },
        {
            provide: MAPBOX_STYLE,
            useValue: environment.mapStyleUrl,
        },
        {
            provide: MAPBOX_WITH_BACKGROUND_STYLE,
            useValue: environment.mapWithBackgroundStyleUrl,
        },
        {
            provide: FIREBASE_CONFIG,
            useValue: environment.firebaseConfig,
        },
        // { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        provideAnimationsAsync(),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    bootstrap: [AppComponent],
})
export class AppModule { }
