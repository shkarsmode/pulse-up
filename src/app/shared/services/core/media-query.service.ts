import { Injectable } from '@angular/core';
import { Observable, fromEvent, map, startWith } from 'rxjs';
import { Breakpoints } from '../../enums/breakpoints.enum';

@Injectable({
    providedIn: 'root',
})
export class MediaQueryService {

    private activeMediaQueries: { [key: string]: Observable<boolean> } = {};

    /*you could also set screenSize type to number and explictly 
    set the number of pixels*/
    mediaQuery(
        type: 'min' | 'max',
        breakPoint: keyof typeof Breakpoints
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
        const mqText = `(${type}-width: ${Breakpoints[breakPoint]})`;
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
