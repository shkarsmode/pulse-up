import { inject } from "@angular/core";
import { HttpHeaders, HttpInterceptorFn } from "@angular/common/http";
import { AuthenticationService } from "../../services/api/authentication.service";

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
    const authenticationService = inject(AuthenticationService);

    const userToken = authenticationService.userTokenValue;
    const anonymousToken = authenticationService.anonymousUserValue;
    const token = userToken || anonymousToken;
    const authToken = req.headers.get("Authorization");

    if (authToken) {
        const headers = new HttpHeaders().set("Authorization", authToken);
        const authReq = req.clone({
            headers: headers,
        });
        return next(authReq);
    }

    if (token) {
        const authReq = req.clone({
            headers: req.headers.set("Authorization", `Bearer ${token}`),
        });
        return next(authReq);
    }

    return next(req);
};

// @Injectable()
// export class JwtInterceptor implements HttpInterceptor {
//     private readonly authenticationService: AuthenticationService = inject(AuthenticationService);

//     intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//         let token: string | null = null;
//         const userToken = this.authenticationService.userTokenValue;
//         const anonymousToken = this.authenticationService.anonymousUserValue;

//         token = userToken || anonymousToken;

//         console.log("JWT Interceptor: ", { token });

//         if (token) {
//             const clonedRequest = this.setAuthorizationHeader({
//                 request,
//                 token,
//             });

//             return next.handle(clonedRequest);
//         }

//         return next.handle(request);
//     }

//     private setAuthorizationHeader({
//         request,
//         token,
//         withCredentials,
//     }: {
//         request: HttpRequest<any>;
//         token: string;
//         withCredentials?: boolean;
//     }): HttpRequest<any> {
//         return request.clone({
//             setHeaders: {
//                 Authorization: `Bearer ${token}`,
//             },
//         });
//     }
// }
