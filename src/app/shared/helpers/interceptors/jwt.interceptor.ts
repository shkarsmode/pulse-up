import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../../services/api/authentication.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(
        private readonly authenticationService: AuthenticationService
    ) {}

    intercept(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        const anonymousToken = this.authenticationService.anonymousUserValue;
        const userTokenValue =
            this.authenticationService.userTokenValue;

        if (userTokenValue) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${userTokenValue}`,
                },
                withCredentials: true,
            });
        } else if (anonymousToken) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${anonymousToken}`,
                },
                withCredentials: false,
            });
        }

        return next.handle(request);
    }
}
