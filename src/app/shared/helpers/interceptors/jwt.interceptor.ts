import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AuthenticationService } from "../../services/api/authentication.service";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    private readonly authenticationService: AuthenticationService = inject(AuthenticationService);

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let token: string | null = null;
        const userToken = this.authenticationService.userTokenValue;
        const anonymousToken = this.authenticationService.anonymousUserValue;

        token = userToken || anonymousToken;

        if (token) {
            
            const clonedRequest = this.setAuthorizationHeader({
                request,
                token,
                withCredentials: !!userToken,
            });
            
            return next.handle(clonedRequest);
        }

        return next.handle(request);
    }

    private setAuthorizationHeader({
        request,
        token,
        withCredentials,
    }: {
        request: HttpRequest<any>;
        token: string;
        withCredentials?: boolean;
    }): HttpRequest<any> {
        return request.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`,
            },
            withCredentials: withCredentials || false,
        });
    }
}
