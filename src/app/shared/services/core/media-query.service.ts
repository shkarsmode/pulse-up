import { Injectable } from "@angular/core";
import { Observable, fromEvent, map, shareReplay, startWith } from "rxjs";
import { Breakpoints } from "../../enums/breakpoints.enum";

interface MediaQueryOptions {
    type: "min" | "max";
    breakPoint: keyof typeof Breakpoints;
    orientation?: "landscape" | "portrait";
    parameter?: "width" | "height";
}

@Injectable({
    providedIn: "root",
})
export class MediaQueryService {
    private activeMediaQueries: Record<string, Observable<boolean>> = {};

    public mediaQuery(
        type: "min" | "max",
        breakPoint: keyof typeof Breakpoints,
        orientation?: "landscape" | "portrait",
        parameter?: "width" | "height",
    ): Observable<boolean>;
    public mediaQuery(config: MediaQueryOptions): Observable<boolean>;

    // Implementation
    public mediaQuery(
        arg1: "min" | "max" | MediaQueryOptions,
        breakPoint?: keyof typeof Breakpoints,
        orientation?: "landscape" | "portrait",
        parameter?: "width" | "height",
    ): Observable<boolean> {
        // Normalize arguments to config object
        const config: MediaQueryOptions =
            typeof arg1 === "string"
                ? {
                      type: arg1,
                      breakPoint: breakPoint!,
                      orientation,
                      parameter,
                  }
                : arg1;

        const { type, breakPoint: bp, orientation: orient, parameter: param } = config;

        const mediaId = `${type}-${bp}-${param || "width"}-${orient || "none"}`;

        if (mediaId in this.activeMediaQueries) {
            return this.activeMediaQueries[mediaId];
        }

        let mqText = `(${type}-${param || "width"}: ${Breakpoints[bp]})`;

        if (orient) {
            mqText += ` and (orientation: ${orient})`;
        }

        const mediaQuery = window.matchMedia(mqText);

        const dynamicMediaQuery = fromEvent<MediaQueryList>(mediaQuery, "change").pipe(
            startWith(mediaQuery),
            map((query: MediaQueryList) => query.matches),
            shareReplay({ bufferSize: 1, refCount: true })
        );

        this.activeMediaQueries[mediaId] = dynamicMediaQuery;
        return dynamicMediaQuery;
    }
}
