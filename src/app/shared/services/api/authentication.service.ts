import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Inject, Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithPhoneNumber, UserCredential, RecaptchaVerifier, Auth } from 'firebase/auth';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { BehaviorSubject, from, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { IFirebaseConfig } from '../../interfaces';
import { API_URL, FIREBASE_CONFIG } from '../../tokens/tokens';
import { IdentityService } from './identity.service';
import { UserService } from './user.service';
import { AppConstants } from '../../constants';
import { WindowService } from '../core/window.service';


@Injectable({
    providedIn: 'root',

})
export class AuthenticationService {
    private readonly apiUrl: string = inject(API_URL);
    private readonly http: HttpClient = inject(HttpClient);
    private readonly windowService: WindowService = inject(WindowService);
    private readonly userService: UserService = inject(UserService);
    private readonly identityService: IdentityService = inject(IdentityService);

    public anonymousUser: Observable<string | null>;
    public isAuthenticatedUser: Observable<string | null>;
    public defaultHeaders = new HttpHeaders();

    private anonymousUser$: BehaviorSubject<string | null>;
    private isAuthenticatedUser$: BehaviorSubject<string | null>;
    private windowRef: Window;
    private firebaseAuth: Auth;

    constructor(
        @Inject(FIREBASE_CONFIG) private readonly firebaseConfig: IFirebaseConfig,
    ) {
        this.firebaseAuth = this.initFirebaseAppWithConfig();

        this.anonymousUser$ = new BehaviorSubject(
            localStorage.getItem('anonymous')
        );
        this.anonymousUser = this.anonymousUser$.asObservable();

        this.isAuthenticatedUser$ = new BehaviorSubject(
            localStorage.getItem('isAuthenticated')
        );
        this.isAuthenticatedUser =
            this.isAuthenticatedUser$.asObservable();

        this.windowRef = this.windowService.windowRef;
    }

    private initFirebaseAppWithConfig(): Auth {
        const app = initializeApp(this.firebaseConfig);
        return getAuth(app);
    }

    public get anonymousUserValue(): string | null {
        return this.anonymousUser$.value;
    }

    public get isAuthenticatedUserValue(): string | null {
        return this.isAuthenticatedUser$.value;
    }

    public loginWithPhoneNumber(phoneNumber: string) {
        return this.identityService.checkIdentity({ phoneNumber })
            .pipe(
                switchMap(this.handleIdentityCheck),
                switchMap(() => this.validatePhoneNumberOnVoip(phoneNumber)),
                switchMap(this.solveRecaptcha),
                switchMap(() => this.sendVerificationCode(phoneNumber))
            );
    }

    public confirmVerificationCode(verificationCode: string): Observable<UserCredential> {
        const confirmationResult = this.windowRef.confirmationResult;
        if (!confirmationResult) {
            return throwError(() => new Error('Confirmation result is not available'));
        }
    
        return from(confirmationResult.confirm(verificationCode)).pipe(
            switchMap((userCredential) => {
                return from(userCredential.user.getIdToken()).pipe(
                    tap((idToken) => {
                        localStorage.setItem('isAuthenticated', idToken);
                        this.isAuthenticatedUser$.next(idToken);
                    }),
                    map(() => userCredential)
                );
            }),
            catchError((error: any) => {
                console.log('Verification error:', error);
                return throwError(() => new Error(error.message));
            })
        );
    }

    public loginAsAnonymousThroughTheFirebase(): Observable<UserCredential> {
        const auth = getAuth();

        return from(signInAnonymously(auth)).pipe(
            catchError((error: any) => {
                console.log(error);
                throw new Error(error.message);
            }),
            map((response: UserCredential | any) => {
                const accessToken = response.user.accessToken;

                localStorage.setItem('anonymous', accessToken);
                this.anonymousUser$.next(accessToken);

                return response;
            })
        );
    }

    /**
     * @deprecated
     */
    public loginAsAnonymous(): Observable<any> {
        const generateId = () => {
            let code = Math.random().toString(36).substr(2, 9).toUpperCase();
            for (let x = 0; x < 5; x++) {
                code +=
                    '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
            }
            return code;
        };

        let params = new HttpParams();
        params = params.append('grant_type', 'device_id');
        params = params.append('device_id', generateId());

        if (this.anonymousUserValue && !this.isTokenExpired) {
            return of(this.anonymousUserValue);
        }

        return this.http
            .post<any>(`${this.apiUrl}/identity/login:anonymous`, {
                body: params
            })
            .pipe(
                catchError((error: any) => {
                    console.log(error);
                    throw new Error(error.message);
                }),
                map((response: any) => {
                    localStorage.setItem(
                        'anonymous',
                        response.idToken
                    );
                    this.anonymousUser$.next(response.idToken);

                    return response;
                })
            );
    }

    // login(formData): Observable<any> {
    //     let headers = this.defaultHeaders;
    //     headers = headers.append(
    //         'content-type',
    //         'application/x-www-form-urlencoded'
    //     );

    //     let params = new HttpParams();
    //     params = params.append('client_id', 'vibespot-spa-client');
    //     params = params.append('client_secret', 'vibespotsecret');
    //     params = params.append('grant_type', 'password');
    //     params = params.append('username', formData.username);
    //     params = params.append('password', formData.password);
    //     params = params.append('scopes', 'offline_access');

    //     return this.http
    //         .request<any>('post', `${this.basePathIdentity}/connect/token`, {
    //             body: params,
    //             headers,
    //             responseType: 'json',
    //             observe: 'response',
    //         })
    //         .pipe(
    //             map((response: any) => {
    //                 localStorage.setItem(
    //                     'isAuthenticated',
    //                     JSON.stringify(response.body)
    //                 );
    //                 this.isAuthenticatedUser$.next(response.body);
    //                 return response;
    //             })
    //         );
    // }

    public logout(): void {
        localStorage.removeItem('isAuthenticated');
        this.isAuthenticatedUser$.next(null);

        localStorage.removeItem('anonymous');
        this.anonymousUser$.next(null);
    }

    private get isTokenExpired(): boolean {
        const token = this.anonymousUserValue;

        if (!token) {
            return true;
        }

        const decodedToken = this.decodeToken(token);
        if (!decodedToken || !decodedToken.exp) {
            return true;
        }

        const currentTime = Math.floor(Date.now() / 1000);
        return decodedToken.exp < currentTime;
    }

    private decodeToken(token: string): JwtPayload | null {
        try {
            return jwtDecode<JwtPayload>(token);
        } catch (error) {
            console.error('Invalid token or unable to decode:', error);
            return null;
        }
    }

    private validatePhoneNumberOnVoip = (phoneNumber: string): Observable<boolean> => {
        return this.userService.validatePhoneNumber(phoneNumber)
            .pipe(
                map((response) => {
                    const lineType = response.lineType;
                    return this.validatePhoneLineType(lineType);
                }),
            );
    }

    private validatePhoneLineType(lineType: string): boolean {
        return Object.values(AppConstants.PHONE_LINE_TYPES).includes(lineType);
    }

    private handleIdentityCheck = (identityCheckResult: boolean): Observable<boolean> => {
        if (!identityCheckResult) return throwError(() => new Error('identity check failed'));
        return of(true);
    }

    private solveRecaptcha = () => {
        this.firebaseAuth.useDeviceLanguage();
        const recaptchaVerifier = new RecaptchaVerifier(this.firebaseAuth, "recaptcha-container", {
            size: "invisible"
        })
        this.windowRef.recaptchaVerifier = recaptchaVerifier;
        return from(recaptchaVerifier.verify())
    }

    private sendVerificationCode = (phoneNumber: string) => {
        const auth = getAuth();
        const appVerifier = this.windowRef.recaptchaVerifier;
        if(!appVerifier) {
            return throwError(() => new Error('RecaptchaVerifier is not initialized'));
        }
        return from(signInWithPhoneNumber(auth, phoneNumber, appVerifier))
            .pipe(
                map((confirmationResult) => {
                    this.windowRef.confirmationResult = confirmationResult;
                }),
                catchError((error) => {
                    console.log('Error sending confirmation code', error);
                    throw error;
                })
            );
    }
}
