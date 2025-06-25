import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
// import {MatSnackBar} from '@angular/material/snack-bar';
import { AuthenticationService } from '../../services/api/authentication.service';
import { Router } from '@angular/router';
import { AppRoutes } from '../../enums/app-routes.enum';
import { LOCAL_STORAGE_KEYS, LocalStorageService } from '../../services/core/local-storage.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<any> =
        new BehaviorSubject<any>(null);
    private appRoutes = AppRoutes

    constructor (
        private readonly router: Router,
        private readonly authenticationService: AuthenticationService,
    ) {}

    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        // if (localStorage.getItem('token') == null) return next.handle(req);
        let authReq = req;

        authReq = this.addTokenHeader(req);
        
        return next.handle(authReq).pipe(
            catchError((error) => {
                console.log(error);
                if (error.status === 504) {
                    // this.snackBar.open(
                    //     'To use this admin panel fully, please, check your connection and try again.',
                    //     'Close',
                    //     {
                    //         duration: 5000,
                    //         horizontalPosition: 'center',
                    //         verticalPosition: 'top',
                    //     }
                    // );

                    return throwError(() => error);
                } else if (
                    (error.status === 401 || error?.error?.error == 'unauthorized_client')
                ) {
                    // this.snackBar.open('Getting new token', 'Close', {
                    //     duration: 2500,
                    //     horizontalPosition: 'center',
                    //     verticalPosition: 'bottom',
                    // });

                    return this.handle401Error(authReq, next);
                }
                return throwError(() => error);
            })
        );
    }

    private handle401Error(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        console.log('handle401Error');
        
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            return this.authenticationService
                .updateToken()
                .pipe(
                    switchMap((token) => {
                        this.isRefreshing = false;
                        this.refreshTokenSubject.next(token);
                        return next.handle(this.addTokenHeader(request));
                    }),
                    catchError((err) => {
                        this.isRefreshing = false;
                        console.log('log out, reason: ', err);
                        this.authenticationService.logout();
                        this.router.navigateByUrl(this.appRoutes.Auth.SIGN_IN);
                        return throwError(() => err);
                    })
                );
        }
        return this.refreshTokenSubject.pipe(
            filter((token) => token !== null),
            take(1),
            switchMap((token) => next.handle(this.addTokenHeader(request)))
        );
    }

    private addTokenHeader(request: HttpRequest<any>) {
        const isAnonymous = LocalStorageService.get<boolean>(LOCAL_STORAGE_KEYS.isAnonymous);
        const userToken = LocalStorageService.get<boolean>(LOCAL_STORAGE_KEYS.userToken);
        
        if (isAnonymous) {
            const token = LocalStorageService.get<string>(LOCAL_STORAGE_KEYS.anonymousToken);
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: false,
            });
        } else if (userToken) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${userToken}`,
                },
                withCredentials: true,
            });
        }

        return request;
            
        // const googleApi = request.url.startsWith(
        //     'https://maps.googleapis.com/maps/api'
        // );
    }
}
