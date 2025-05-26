import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { inject, Inject, Injectable } from "@angular/core";
import { FirebaseError, initializeApp } from "firebase/app";
import {
    getAuth,
    signInAnonymously,
    signInWithPhoneNumber,
    UserCredential,
    RecaptchaVerifier,
    Auth,
    signOut,
} from "firebase/auth";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { BehaviorSubject, from, Observable, of, throwError } from "rxjs";
import { catchError, map, switchMap, tap } from "rxjs/operators";
import { IFirebaseConfig, IProfile } from "../../interfaces";
import { API_URL, FIREBASE_CONFIG } from "../../tokens/tokens";
import { IdentityService } from "./identity.service";
import { UserService } from "./user.service";
import { AppConstants } from "../../constants";
import { WindowService } from "../core/window.service";
import { LocalStorageService } from "../core/local-storage.service";

@Injectable({
    providedIn: "root",
})
export class AuthenticationService {
    private readonly apiUrl: string = inject(API_URL);
    private readonly http: HttpClient = inject(HttpClient);
    private readonly windowService: WindowService = inject(WindowService);
    private readonly userService: UserService = inject(UserService);
    private readonly identityService: IdentityService = inject(IdentityService);

    public anonymousUser: Observable<string | null>;
    public userToken: Observable<string | null>;
    public defaultHeaders = new HttpHeaders();
    public isSigninInProgress$: BehaviorSubject<boolean>;
    public isConfirmInProgress$: BehaviorSubject<boolean>;

    private anonymousUser$: BehaviorSubject<string | null>;
    private userToken$: BehaviorSubject<string | null>;
    private windowRef: Window;
    private firebaseAuth: Auth;

    constructor(@Inject(FIREBASE_CONFIG) private readonly firebaseConfig: IFirebaseConfig) {
        this.firebaseAuth = this.initFirebaseAppWithConfig();
        this.anonymousUser$ = new BehaviorSubject(LocalStorageService.get("anonymous"));
        this.anonymousUser = this.anonymousUser$.asObservable();
        this.userToken$ = new BehaviorSubject(LocalStorageService.get<string>("userToken"));
        this.userToken = this.userToken$.asObservable();
        this.isSigninInProgress$ = new BehaviorSubject<boolean>(false);
        this.isConfirmInProgress$ = new BehaviorSubject<boolean>(false);
        this.windowRef = this.windowService.windowRef;
    }

    private initFirebaseAppWithConfig(): Auth {
        const app = initializeApp(this.firebaseConfig);
        return getAuth(app);
    }

    public get anonymousUserValue(): string | null {
        return this.anonymousUser$.value;
    }

    public get userTokenValue(): string | null {
        return this.userToken$.value;
    }

    public loginWithPhoneNumber(phoneNumber: string) {
        return of(null).pipe(
            tap(() => this.isSigninInProgress$.next(true)),
            switchMap(this.loginAsAnonymousThroughTheFirebase),
            switchMap(() => this.identityService.checkByPhoneNumber(phoneNumber)),
            switchMap(this.handleIdentityCheckByPhoneNumber),
            switchMap(() => this.validatePhoneNumberOnVoip(phoneNumber)),
            switchMap(this.logout),
            switchMap(this.solveRecaptcha),
            switchMap(() => this.sendVerificationCode(phoneNumber)),
            tap(() => this.isSigninInProgress$.next(false)),
            catchError((error) => {
                this.isSigninInProgress$.next(false);
                return this.handleLoginWithPhoneNumberError(error);
            }),
        );
    }

    public confirmVerificationCode(verificationCode: string): Observable<IProfile> {
        const confirmationResult = this.windowRef.confirmationResult;
        if (!confirmationResult) {
            return throwError(() => new Error("Confirmation result is not available"));
        }

        return of(null).pipe(
            tap(() => this.isConfirmInProgress$.next(true)),
            switchMap(() => from(confirmationResult.confirm(verificationCode))),
            switchMap(this.getIdToken),
            switchMap(this.createUserWithToken),
            switchMap(this.updateAuthenticatedUserdData),
            tap(() => this.isConfirmInProgress$.next(false)),
            catchError((error) => {
                this.isConfirmInProgress$.next(false);
                return this.handleConfirmCodeVerificationError(error);
            }),
        );
    }

    public loginAsAnonymousThroughTheFirebase = (): Observable<UserCredential> => {
        return from(signInAnonymously(this.firebaseAuth)).pipe(
            map((response: UserCredential | any) => {
                const accessToken = response.user.accessToken;
                LocalStorageService.set("anonymous", accessToken);
                LocalStorageService.set("isAnonymous", true);
                this.anonymousUser$.next(accessToken);

                return response;
            }),
        );
    }

    /**
     * @deprecated
     */
    public loginAsAnonymous(): Observable<any> {
        const generateId = () => {
            let code = Math.random().toString(36).substr(2, 9).toUpperCase();
            for (let x = 0; x < 5; x++) {
                code += "-" + Math.random().toString(36).substr(2, 9).toUpperCase();
            }
            return code;
        };

        let params = new HttpParams();
        params = params.append("grant_type", "device_id");
        params = params.append("device_id", generateId());

        if (this.anonymousUserValue && !this.isTokenExpired) {
            return of(this.anonymousUserValue);
        }

        return this.http
            .post<any>(`${this.apiUrl}/identity/login:anonymous`, {
                body: params,
            })
            .pipe(
                catchError((error: any) => {
                    console.log(error);
                    throw new Error(error.message);
                }),
                map((response: any) => {
                    localStorage.setItem("anonymous", response.idToken);
                    this.anonymousUser$.next(response.idToken);

                    return response;
                }),
            );
    }

    public logout = () => {
        return from(signOut(this.firebaseAuth)).pipe(
            tap(() => {
                LocalStorageService.remove("userToken");
                this.userToken$.next(null);

                LocalStorageService.remove("anonymous");
                this.anonymousUser$.next(null);

                LocalStorageService.remove("isAnonymous");
                LocalStorageService.remove("token");
            }),
            catchError((error: any) => {
                throw new Error(error.message);
            }),
        );
    };

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
            console.error("Invalid token or unable to decode:", error);
            return null;
        }
    }

    private validatePhoneNumberOnVoip = (phoneNumber: string): Observable<boolean> => {
        return this.userService.validatePhoneNumber(phoneNumber).pipe(
            map((response) => {
                const lineType = response.lineType;
                return this.validatePhoneLineType(lineType);
            }),
        );
    };

    private validatePhoneLineType(lineType: string): boolean {
        return Object.values(AppConstants.PHONE_LINE_TYPES).includes(lineType);
    }

    private handleIdentityCheckByPhoneNumber = (
        identityCheckResult: boolean,
    ): Observable<boolean> => {
        if (!identityCheckResult) return throwError(() => new Error("Provided phoner number cannot be used for registration"));
        return of(true);
    };

    private solveRecaptcha = () => {
        this.firebaseAuth.useDeviceLanguage();
        const recaptchaVerifier = new RecaptchaVerifier(this.firebaseAuth, "recaptcha-container", {
            size: "invisible",
        });
        this.windowRef.recaptchaVerifier = recaptchaVerifier;
        return from(recaptchaVerifier.verify());
    };

    private sendVerificationCode = (phoneNumber: string) => {
        const appVerifier = this.windowRef.recaptchaVerifier;
        if (!appVerifier) {
            return throwError(() => new Error("Recaptcha verification failed. Please try again."));
        }
        return from(signInWithPhoneNumber(this.firebaseAuth, phoneNumber, appVerifier)).pipe(
            map((confirmationResult) => {
                this.windowRef.confirmationResult = confirmationResult;
            }),
            tap(() => {
                LocalStorageService.set("phoneNumberForSignin", phoneNumber);
            }),
        );
    };

    private getIdToken = (userCredential: UserCredential): Observable<string> => {
        return from(userCredential.user.getIdToken()).pipe(
            map((idToken) => idToken),
        );
    };

    private createUserWithToken = (token: string): Observable<IProfile & { token: string }> => {
        return from(this.identityService.getByToken(token)).pipe(
            switchMap((profile) => {
                if (profile) {
                    return of({ ...profile, token });
                }
                return this.identityService.createWithToken(token).pipe(
                    catchError(() => {
                        console.log("Error creating profile with token");
                        return throwError(() => new Error("Failed to create profile with token"));
                    }),
                    map((newProfile) => {
                        if (!newProfile) {
                            throw new Error("Failed to create profile with token");
                        }
                        return { ...newProfile, token };
                    }),
                );
            }),
        );
    };

    private updateAuthenticatedUserdData = (userData: IProfile & { token: string }): Observable<IProfile> => {
        return of(userData).pipe(
            tap(({ token }) => {
                LocalStorageService.set("userToken", token);
                LocalStorageService.set("isAnonymous", false);
                LocalStorageService.remove("phoneNumberForSignin");
                LocalStorageService.remove("anonymous");
                this.userToken$.next(token);
                this.anonymousUser$.next(null);
                this.isConfirmInProgress$.next(false);
                delete this.windowRef.recaptchaVerifier;
                delete this.windowRef.confirmationResult;
            }),
            map(({ token, ...profile }) => profile),
        );
    };

    private handleLoginWithPhoneNumberError = (error: any) => {
        console.log("Error sending verification code", error);
        LocalStorageService.remove("phoneNumberForSignin");
        delete this.windowRef.recaptchaVerifier;
        return throwError(() => new Error(error?.message || "Error sending verification code"));
    };

    private handleConfirmCodeVerificationError = (error: any): Observable<never> => {
        console.error("Error verifying confirmation code", error);
        LocalStorageService.remove("phoneNumberForSignin");
        delete this.windowRef.confirmationResult;
        return throwError(() => new Error(error?.message || "Error verifying confirmation code"));
    };
}
