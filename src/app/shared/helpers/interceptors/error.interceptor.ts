import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { catchError, filter, switchMap, take } from "rxjs/operators";
import { AuthenticationService } from "../../services/api/authentication.service";
import { Router } from "@angular/router";
import { AppRoutes } from "../../enums/app-routes.enum";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const authenticationService = inject(AuthenticationService);

    const refreshTokenSubject = new BehaviorSubject<string | null>(null);
    const anonymousToken = authenticationService.anonymousUserValue;
    const userToken = authenticationService.userTokenValue;
    const token = userToken || anonymousToken || "";
    let isRefreshing = false;

    const handle401Error = (
        request: HttpRequest<unknown>,
        next: HttpHandlerFn,
    ): Observable<HttpEvent<unknown>> => {
        console.log("handle401Error");

        if (!isRefreshing) {
            isRefreshing = true;
            refreshTokenSubject.next(null);

            return authenticationService.updateToken().pipe(
                switchMap((token) => {
                    isRefreshing = false;
                    refreshTokenSubject.next(token);
                    return next(setAuthorizationHeader(request, token));
                }),
                catchError((err: unknown) => {
                    isRefreshing = false;
                    console.log("log out, reason: ", err);
                    router.navigateByUrl(AppRoutes.Auth.SIGN_IN);
                    return throwError(() => err);
                }),
            );
        }
        return refreshTokenSubject.pipe(
            filter((token) => token !== null),
            take(1),
            switchMap((token) => next(setAuthorizationHeader(request, token))),
        );
    };

    const requestWithAuthToken = setAuthorizationHeader(req, token);

    return next(requestWithAuthToken).pipe(
        catchError((error) => {
            if (error.status === 504) {
                return throwError(() => error);
            } else if (error.status === 401 || error?.error?.error == "unauthorized_client") {
                isRefreshing = false;
                return handle401Error(requestWithAuthToken, next);
            }
            return throwError(() => error);
        }),
    );
};

const setAuthorizationHeader = (request: HttpRequest<unknown>, token: string) => {
    return request.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`,
        },
    });
};

// @Injectable()
// export class ErrorInterceptor implements HttpInterceptor {
//     private isRefreshing = false;
//     private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
//     private appRoutes = AppRoutes;

//     constructor(
//         private readonly router: Router,
//         private readonly authenticationService: AuthenticationService,
//     ) {}

//     intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//         let authReq = req;

//         authReq = this.addTokenHeader(req);

//         return next.handle(authReq).pipe(
//             catchError((error) => {
//                 if (error.status === 504) {
//                     return throwError(() => error);
//                 } else if (error.status === 401 || error?.error?.error == "unauthorized_client") {
//                     this.isRefreshing = false;
//                     return this.handle401Error(authReq, next);
//                 }
//                 return throwError(() => error);
//             }),
//         );
//     }

//     private handle401Error(
//         request: HttpRequest<any>,
//         next: HttpHandler,
//     ): Observable<HttpEvent<any>> {
//         console.log("handle401Error");

//         if (!this.isRefreshing) {
//             this.isRefreshing = true;
//             this.refreshTokenSubject.next(null);

//             return this.authenticationService.updateToken().pipe(
//                 switchMap((token) => {
//                     this.isRefreshing = false;
//                     this.refreshTokenSubject.next(token);
//                     return next.handle(this.addTokenHeader(request));
//                 }),
//                 catchError((err) => {
//                     this.isRefreshing = false;
//                     console.log("log out, reason: ", err);
//                     this.router.navigateByUrl(this.appRoutes.Auth.SIGN_IN);
//                     return throwError(() => err);
//                 }),
//             );
//         }
//         return this.refreshTokenSubject.pipe(
//             filter((token) => token !== null),
//             take(1),
//             switchMap((token) => next.handle(this.addTokenHeader(request))),
//         );
//     }

//     private addTokenHeader(request: HttpRequest<any>) {
//         const anonymousToken = this.authenticationService.anonymousUserValue;
//         const userToken = this.authenticationService.userTokenValue;

//         if (anonymousToken) {
//             request = request.clone({
//                 setHeaders: {
//                     Authorization: `Bearer ${anonymousToken}`,
//                 },
//                 withCredentials: false,
//             });
//         } else if (userToken) {
//             request = request.clone({
//                 setHeaders: {
//                     Authorization: `Bearer ${userToken}`,
//                 },
//                 withCredentials: true,
//             });
//         }

//         return request;
//     }
// }
