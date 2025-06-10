import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { from, Observable, switchMap } from "rxjs";
import { AuthenticationService } from "../../services/api/authentication.service";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private readonly authenticationService: AuthenticationService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const currentUser = this.authenticationService.firebaseAuth.currentUser;
        if (!currentUser) return next.handle(request);

        return from(currentUser.getIdToken()).pipe(
            switchMap((token) => {
                const cloned = request.clone({
                    setHeaders: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: !currentUser.isAnonymous,
                });
                return next.handle(cloned);
            }),
        );
    }
}
