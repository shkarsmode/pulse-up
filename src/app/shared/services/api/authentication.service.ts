import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { inject, Inject, Injectable } from "@angular/core";
import { FirebaseApp, FirebaseError, initializeApp } from "firebase/app";
import {
    getAuth,
    signInAnonymously,
    signInWithPhoneNumber,
    sendSignInLinkToEmail,
    UserCredential,
    RecaptchaVerifier,
    Auth,
    signOut,
    isSignInWithEmailLink,
    EmailAuthProvider,
    linkWithCredential,
    User,
    verifyBeforeUpdateEmail,
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
import { LOCAL_STORAGE_KEYS, LocalStorageService } from "../core/local-storage.service";
import { formatFirebaseError } from "@/app/features/auth/utils/formatFirebaseError";

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
    public isResendInProgress$: BehaviorSubject<boolean>;

    private anonymousUser$: BehaviorSubject<string | null>;
    private userToken$: BehaviorSubject<string | null>;
    private windowRef: Window;
    private firebaseApp: FirebaseApp;

    constructor(@Inject(FIREBASE_CONFIG) private readonly firebaseConfig: IFirebaseConfig) {
        this.firebaseApp = this.initFirebaseAppWithConfig();
        this.anonymousUser$ = new BehaviorSubject(LocalStorageService.get("anonymous"));
        this.anonymousUser = this.anonymousUser$.asObservable();
        this.userToken$ = new BehaviorSubject(LocalStorageService.get<string>("userToken"));
        this.userToken = this.userToken$.asObservable();
        this.isSigninInProgress$ = new BehaviorSubject<boolean>(false);
        this.isConfirmInProgress$ = new BehaviorSubject<boolean>(false);
        this.isResendInProgress$ = new BehaviorSubject<boolean>(false);
        this.windowRef = this.windowService.windowRef;
    }

    public get firebaseAuth(): Auth {
        return getAuth(this.firebaseApp);
    }

    private initFirebaseAppWithConfig() {
        return initializeApp(this.firebaseConfig);
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
            switchMap(this.prepareRecaptcha),
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

    public resendVerificationCode() {
        const phoneNumber = LocalStorageService.get<string>("phoneNumberForSignin");
        if (!phoneNumber) {
            return throwError(() => new Error("Failed to resend verification code. Please try again to login."));
        }
        return of(null).pipe(
            tap(() => this.isResendInProgress$.next(true)),
            switchMap(this.logout),
            switchMap(this.prepareRecaptcha),
            switchMap(() => this.sendVerificationCode(phoneNumber)),
            tap(() => this.isResendInProgress$.next(false)),
            catchError((error) => {
                this.isResendInProgress$.next(false)
                return this.handleLoginWithPhoneNumberError(error);
            }),
        )
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

    public verifyEmail = ({ email, continueUrl }: { email: string, continueUrl: string }) => {
        return from(sendSignInLinkToEmail(this.firebaseAuth, email, {
            url: continueUrl,
            handleCodeInApp: true,
        })).pipe(
            tap(() => {
                LocalStorageService.set(LOCAL_STORAGE_KEYS.verifyEmail, email);
            }),
            catchError(this.handleEmailVerificationError),
        )
    }

    public linkVerifiedEmail = ({ continueUrl }: { continueUrl: string }): Observable<User | null> => {
        // Not a valid email sign-in link
        if (!isSignInWithEmailLink(this.firebaseAuth, this.windowRef.location.href)) {
            return of(null);
        }

        const email = LocalStorageService.get<string>(LOCAL_STORAGE_KEYS.verifyEmail);
        if (!email) {
            return throwError(() => new Error('Email not found.'));
        }

        const user = this.firebaseAuth.currentUser;
        if (!user) {
            return throwError(() => new Error('No authenticated user found.'));
        }

        const credential = EmailAuthProvider.credentialWithLink(email, continueUrl);

        return from(linkWithCredential(user, credential)).pipe(
            switchMap(() => from(user.reload())),
            switchMap(() => {
                const updatedUser = this.firebaseAuth.currentUser;
                if (!updatedUser) {
                    return throwError(() => new Error('Failed to update user after linking email.'));
                }
                return of(updatedUser);
            }),
            tap(() => {
                LocalStorageService.remove(LOCAL_STORAGE_KEYS.verifyEmail);
            })
        );
    };

    public changeEmail = ({ email, continueUrl }: { email: string, continueUrl: string }) => {
        const user = this.firebaseAuth.currentUser;
        if (!user) {
            return throwError(() => new Error('No authenticated user found.'));
        }
        return from(verifyBeforeUpdateEmail(user, email, {
            url: continueUrl,
            handleCodeInApp: true,
        })).pipe(
            tap(() => {
                LocalStorageService.set(LOCAL_STORAGE_KEYS.changeEmail, email);
            }),
            catchError(this.handleEmailChangingError),
        )
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

                LocalStorageService.remove(LOCAL_STORAGE_KEYS.personalInfoPopupShown)
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

    private prepareRecaptcha = () => {
        this.windowRef.recaptchaVerifier?.clear();
        const recaptchaId = `recaptcha-container-${Math.random().toString(36).substring(2, 15)}`;
        const recaptchaContainer = document.getElementById("recaptcha-container");
        if (recaptchaContainer) {
            recaptchaContainer.innerHTML = `<div id="${recaptchaId}"></div>`;
        }
        this.firebaseAuth.useDeviceLanguage();
        const recaptchaVerifier = new RecaptchaVerifier(this.firebaseAuth, recaptchaId, {
            size: "invisible",
        });
        this.windowRef.recaptchaVerifier = recaptchaVerifier;
        return of(recaptchaVerifier)
    };

    private sendVerificationCode = (phoneNumber: string) => {
        const recaptchaVerifier = this.windowRef.recaptchaVerifier;
        if (!recaptchaVerifier) {
            return throwError(() => new Error("Recaptcha verification failed. Please try again."));
        }
        return from(signInWithPhoneNumber(this.firebaseAuth, phoneNumber, recaptchaVerifier)).pipe(
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
                this.windowRef.recaptchaVerifier?.clear();
                delete this.windowRef.recaptchaVerifier;
                delete this.windowRef.confirmationResult;
            }),
            map(({ token, ...profile }) => profile),
        );
    };

    private handleLoginWithPhoneNumberError = (error: any) => {
        console.log("Error sending verification code", error);
        LocalStorageService.remove("phoneNumberForSignin");
        return throwError(() => error);
    };

    private handleConfirmCodeVerificationError = (error: any): Observable<never> => {
        console.error("Error verifying confirmation code", error);
        LocalStorageService.remove("phoneNumberForSignin");
        return throwError(() => error);
    };

    private handleEmailVerificationError = (error: any) => {
        console.error("Error verifying email", error);
        LocalStorageService.remove(LOCAL_STORAGE_KEYS.verifyEmail);

        let errorMessage = "Failed to verify email. Please try again.";
        if (error instanceof FirebaseError) {
            errorMessage = formatFirebaseError(error) || errorMessage;
        }
        return throwError(() => new Error(errorMessage));
    };

    private handleEmailChangingError = (error: any) => {
        console.error("Error changing email", error);
        LocalStorageService.remove(LOCAL_STORAGE_KEYS.changeEmail);

        let errorMessage = "Failed to change email. Please try again.";
        if (error instanceof FirebaseError) {
            errorMessage = formatFirebaseError(error) || errorMessage;
        }
        return throwError(() => new Error(errorMessage));
    };
}
