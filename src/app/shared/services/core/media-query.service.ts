import { Injectable } from '@angular/core';
import { Observable, fromEvent, map, startWith } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MediaQueryService {
    private readonly BREAKPOINTS = {
        /*you can use fixed breakpoints or customize the behavior
      with a function parameter */
        xl: '1200px',
        lg: '992px',
        md: '768px',
        sm: '576px',
        xs: '480px',
        "2xs": '375px',
    };

    private activeMediaQueries: { [key: string]: Observable<boolean> } = {};

    /*you could also set screenSize type to number and explictly 
    set the number of pixels*/
    mediaQuery(
        type: 'min' | 'max',
        breakPoint: keyof typeof this.BREAKPOINTS
    ): Observable<boolean> {
        /*creates a string to identify the media query 
      Inside the activeMediaQueries obj*/
        const mediaId = `${type}-${breakPoint}`;

        //if a media-query of the same type has been already created, return it
        if (mediaId in this.activeMediaQueries) {
            return this.activeMediaQueries[mediaId];
        }

        /* else create a new media query observable and add it to the 
       activeMediaQueries obj */
        const mqText = `(${type}-width: ${this.BREAKPOINTS[breakPoint]})`;
        const mediaQuery = window.matchMedia(mqText);

        const dynamicMediaQuery = fromEvent<MediaQueryList>(
            mediaQuery,
            'change'
        ).pipe(
            startWith(mediaQuery),
            map((query: MediaQueryList) => query.matches)
        );

        this.activeMediaQueries[mediaId] = dynamicMediaQuery;
        return dynamicMediaQuery;
    }
}
