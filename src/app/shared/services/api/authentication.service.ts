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
    PhoneAuthProvider,
    updatePhoneNumber,
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
import { formatFirebaseError } from "../../helpers/formatFirebaseError";
import {
    AuthenticationErrorCode,
    AuthenticationError,
} from "../../helpers/errors/authentication-error";

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
    public isChangePhoneNumberInProgress$: BehaviorSubject<boolean>;
    public isResendInProgress$: BehaviorSubject<boolean>;

    private anonymousUser$: BehaviorSubject<string | null>;
    private userToken$: BehaviorSubject<string | null>;
    private windowRef: Window;
    private firebaseApp: FirebaseApp;

    constructor(@Inject(FIREBASE_CONFIG) private readonly firebaseConfig: IFirebaseConfig) {
        this.firebaseApp = this.initFirebaseAppWithConfig();
        this.anonymousUser$ = new BehaviorSubject(LocalStorageService.get<string>(LOCAL_STORAGE_KEYS.anonymousToken));
        this.anonymousUser = this.anonymousUser$.asObservable();
        this.userToken$ = new BehaviorSubject(LocalStorageService.get<string>(LOCAL_STORAGE_KEYS.userToken));
        this.userToken = this.userToken$.asObservable();
        this.isSigninInProgress$ = new BehaviorSubject<boolean>(false);
        this.isConfirmInProgress$ = new BehaviorSubject<boolean>(false);
        this.isResendInProgress$ = new BehaviorSubject<boolean>(false);
        this.isChangePhoneNumberInProgress$ = new BehaviorSubject<boolean>(false);
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
            switchMap(this.handlePhoneNumberVoipValidation),
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
            return throwError(
                () =>
                    new AuthenticationError(
                        "Confirmation result is not available",
                        AuthenticationErrorCode.INVALID_CREDENTIALS,
                    ),
            );
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
            return throwError(
                () => new AuthenticationError("Failed to resend verification code. Please try again.", AuthenticationErrorCode.INVALID_CREDENTIALS),
            );
        }
        return of(null).pipe(
            tap(() => this.isResendInProgress$.next(true)),
            switchMap(this.prepareRecaptcha),
            switchMap(() => this.sendVerificationCode(phoneNumber)),
            tap(() => this.isResendInProgress$.next(false)),
            catchError((error) => {
                this.isResendInProgress$.next(false);
                return this.handleResendPhoneNumberError(error);
            }),
        );
    }

    public loginAsAnonymousThroughTheFirebase = (): Observable<UserCredential> => {
        return from(signInAnonymously(this.firebaseAuth)).pipe(
            map((response: UserCredential | any) => {
                const accessToken = response.user.accessToken;
                LocalStorageService.set(LOCAL_STORAGE_KEYS.anonymousToken, accessToken);
                LocalStorageService.set(LOCAL_STORAGE_KEYS.isAnonymous, true);
                this.anonymousUser$.next(accessToken);

                return response;
            }),
        );
    };

    public verifyEmail = ({ email, continueUrl }: { email: string; continueUrl: string }) => {
        return from(
            sendSignInLinkToEmail(this.firebaseAuth, email, {
                url: continueUrl,
                handleCodeInApp: true,
            }),
        ).pipe(
            tap(() => {
                LocalStorageService.set(LOCAL_STORAGE_KEYS.verifyEmail, email);
            }),
            catchError(this.handleEmailVerificationError),
        );
    };

    public linkVerifiedEmail = ({
        continueUrl,
    }: {
        continueUrl: string;
    }): Observable<User | null> => {
        // Not a valid email sign-in link
        if (!isSignInWithEmailLink(this.firebaseAuth, this.windowRef.location.href)) {
            return of(null);
        }

        const email = LocalStorageService.get<string>(LOCAL_STORAGE_KEYS.verifyEmail);
        if (!email) {
            return throwError(() => new AuthenticationError("Email not found.", AuthenticationErrorCode.INVALID_CREDENTIALS));
        }

        const user = this.firebaseAuth.currentUser;
        if (!user) {
            return throwError(() => new AuthenticationError("No authenticated user found.", AuthenticationErrorCode.INVALID_CREDENTIALS));
        }

        const credential = EmailAuthProvider.credentialWithLink(email, continueUrl);

        return from(linkWithCredential(user, credential)).pipe(
            tap(() => user.reload()),
            switchMap(() => {
                const updatedUser = this.firebaseAuth.currentUser;
                if (!updatedUser) {
                    return throwError(
                        () => new AuthenticationError("Failed to update user after linking email.", AuthenticationErrorCode.INVALID_CREDENTIALS),
                    );
                }
                return of(updatedUser);
            }),
            tap(() => {
                LocalStorageService.remove(LOCAL_STORAGE_KEYS.verifyEmail);
            }),
        );
    };

    public changeEmail = ({ email, continueUrl }: { email: string; continueUrl: string }) => {
        const user = this.firebaseAuth.currentUser;
        if (!user) {
            return throwError(() => new AuthenticationError("No authenticated user found.", AuthenticationErrorCode.INVALID_CREDENTIALS));
        }
        return from(
            verifyBeforeUpdateEmail(user, email, {
                url: continueUrl,
                handleCodeInApp: true,
            }),
        ).pipe(
            tap(() => {
                LocalStorageService.set(LOCAL_STORAGE_KEYS.changeEmail, email);
            }),
            catchError(this.handleEmailChangingError),
        );
    };

    public changePhoneNumber = (phoneNumber: string) => {
        return of(null).pipe(
            tap(() => this.isChangePhoneNumberInProgress$.next(true)),
            switchMap(this.prepareRecaptcha),
            switchMap(() => this.identityService.checkByPhoneNumber(phoneNumber)),
            switchMap(this.handleCheckPhoneNumberBeforeChange),
            switchMap(() => this.validatePhoneNumberOnVoip(phoneNumber)),
            switchMap(this.handlePhoneNumberVoipValidation),
            switchMap(() => this.sendVerificationCodeToNewPhoneNumber(phoneNumber)),
            tap((verificationId) => {
                this.isChangePhoneNumberInProgress$.next(false);
                LocalStorageService.set(LOCAL_STORAGE_KEYS.verificationId, verificationId);
                LocalStorageService.set(LOCAL_STORAGE_KEYS.phoneNumberForChanging, phoneNumber);
            }),
            catchError(this.handleChangePhoneNumberError),
        );
    };

    public confirmNewPhoneNumber = (verificationCode: string) => {
        if (this.windowRef.recaptchaVerifier) {
            this.windowRef.recaptchaVerifier?.clear();
            this.windowRef.recaptchaVerifier = undefined;
        }
        const verificationId = LocalStorageService.get<string>(LOCAL_STORAGE_KEYS.verificationId);
        if (!verificationId) {
            console.log("Verification ID not found.");
            return throwError(
                () =>
                    new AuthenticationError(
                        "Failed to verify phone number. Please try again.",
                        AuthenticationErrorCode.INVALID_CREDENTIALS,
                    ),
            );
        }

        const phoneNumberForChanging = LocalStorageService.get<string>(
            LOCAL_STORAGE_KEYS.phoneNumberForChanging,
        );
        if (!phoneNumberForChanging) {
            console.log("Phone number for changing not found.");
            return throwError(
                () =>
                    new AuthenticationError(
                        "Failed to verify phone number. Please try again.",
                        AuthenticationErrorCode.INVALID_CREDENTIALS,
                    ),
            );
        }

        const user = this.firebaseAuth.currentUser;
        if (!user) {
            console.log("No authenticated user found for changing phone number.");
            return throwError(
                () =>
                    new AuthenticationError(
                        "Failed to verify phone number. Please try again.",
                        AuthenticationErrorCode.INVALID_CREDENTIALS,
                    ),
            );
        }

        const phoneCredential = PhoneAuthProvider.credential(verificationId, verificationCode);
        return of(null).pipe(
            tap(() => this.isConfirmInProgress$.next(true)),
            switchMap(() => updatePhoneNumber(user, phoneCredential)),
            tap(() => {
                this.isConfirmInProgress$.next(false);
                LocalStorageService.remove(LOCAL_STORAGE_KEYS.verificationId);
                LocalStorageService.remove(LOCAL_STORAGE_KEYS.phoneNumberForChanging);
            }),
            catchError(this.handleConfirmNewPhoneNumberError),
        );
    };

    public logout = () => {
        return from(signOut(this.firebaseAuth)).pipe(
            tap(() => {
                LocalStorageService.remove(LOCAL_STORAGE_KEYS.userToken);
                this.userToken$.next(null);

                LocalStorageService.remove(LOCAL_STORAGE_KEYS.anonymousToken);
                this.anonymousUser$.next(null);

                LocalStorageService.remove(LOCAL_STORAGE_KEYS.isAnonymous);
            }),
            catchError((error: any) => {
                throw new AuthenticationError(error.message, AuthenticationErrorCode.UNKNOWN_ERROR);
            }),
        );
    };

    public updateToken = () => {
        const user = this.firebaseAuth.currentUser;
        if (!user) {
            return throwError(() => new AuthenticationError("No authenticated user found.", AuthenticationErrorCode.INVALID_CREDENTIALS));
        }
        const isAnonymous = LocalStorageService.get<boolean>(LOCAL_STORAGE_KEYS.isAnonymous);
        return from(user.getIdToken(true)).pipe(
            map((newToken: string) => {
                if (isAnonymous) {
                    LocalStorageService.set(LOCAL_STORAGE_KEYS.anonymousToken, newToken);
                    this.anonymousUser$.next(newToken);
                } else {
                    LocalStorageService.set(LOCAL_STORAGE_KEYS.userToken, newToken);
                    this.userToken$.next(newToken);
                }
                return newToken;
            }),
            catchError((error: any) => {
                return throwError(() => new AuthenticationError(error.message, AuthenticationErrorCode.UNKNOWN_ERROR));
            }),
        )
    }

    public isTokenExpired(token: string): boolean {
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

    public stopSignInProgress = () => {
        this.isSigninInProgress$.next(false);
    }

    private decodeToken(token: string): JwtPayload | null {
        try {
            return jwtDecode<JwtPayload>(token);
        } catch (error) {
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
        if (!identityCheckResult)
            return throwError(
                () =>
                    new AuthenticationError(
                        "Registration temporarily unavailable for this phone number",
                        AuthenticationErrorCode.INVALID_CREDENTIALS,
                    ),
            );
        return of(true);
    };

    private handleCheckPhoneNumberBeforeChange = (
        identityCheckResult: boolean,
    ): Observable<boolean> => {
        if (!identityCheckResult)
            return throwError(
                () =>
                    new AuthenticationError(
                        "An account already exists with the same phone number.",
                        AuthenticationErrorCode.INVALID_CREDENTIALS,
                    ),
            );
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
        return of(recaptchaVerifier);
    };

    private sendVerificationCode = (phoneNumber: string) => {
        const recaptchaVerifier = this.windowRef.recaptchaVerifier;
        if (!recaptchaVerifier) {
            return throwError(
                () =>
                    new AuthenticationError(
                        "Recaptcha verification failed. Please try again.",
                        AuthenticationErrorCode.INVALID_RECAPTCHA,
                    ),
            );
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
        return from(userCredential.user.getIdToken()).pipe(map((idToken) => idToken));
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
                        return throwError(
                            () =>
                                new AuthenticationError(
                                    "Failed to create profile. Please try again.",
                                    AuthenticationErrorCode.INTERBAL_SERVER_ERROR,
                                ),
                        );
                    }),
                    map((newProfile) => {
                        if (!newProfile) {
                            throw new AuthenticationError(
                                "Failed to create profile. Please try again.",
                                AuthenticationErrorCode.INTERBAL_SERVER_ERROR,
                            );
                        }
                        return { ...newProfile, token };
                    }),
                );
            }),
        );
    };

    private updateAuthenticatedUserdData = (
        userData: IProfile & { token: string },
    ): Observable<IProfile> => {
        return of(userData).pipe(
            tap(({ token }) => {
                LocalStorageService.set(LOCAL_STORAGE_KEYS.userToken, token);
                LocalStorageService.set(LOCAL_STORAGE_KEYS.isAnonymous, false);
                LocalStorageService.remove("phoneNumberForSignin");
                LocalStorageService.remove(LOCAL_STORAGE_KEYS.anonymousToken);
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

    private sendVerificationCodeToNewPhoneNumber = (phoneNumber: string) => {
        const provider = new PhoneAuthProvider(this.firebaseAuth);
        const applicationVerifier = this.windowRef.recaptchaVerifier;
        if (!applicationVerifier) {
            return throwError(
                () =>
                    new AuthenticationError(
                        "Recaptcha verification failed. Please try again.",
                        AuthenticationErrorCode.INVALID_RECAPTCHA,
                    ),
            );
        }
        return from(provider.verifyPhoneNumber(phoneNumber, applicationVerifier));
    };

    private handleLoginWithPhoneNumberError = (error: any) => {
        console.log("Error sending verification code", error);
        LocalStorageService.remove("phoneNumberForSignin");

        if (error instanceof AuthenticationError) return throwError(() => error);

        let errorMessage = "Failed to send verification code. Please try again.";
        if (error instanceof FirebaseError) {
            errorMessage = formatFirebaseError(error) || errorMessage;
            return throwError(
                () => new AuthenticationError(errorMessage, AuthenticationErrorCode.FIREBASE_ERROR),
            );
        }
        return throwError(
            () => new AuthenticationError(errorMessage, AuthenticationErrorCode.UNKNOWN_ERROR),
        );
    };

    private handleResendPhoneNumberError = (error: any) => {
        console.log("Error resending verification code", error);

        if (error instanceof AuthenticationError) return throwError(() => error);

        let errorMessage = "Failed to resend verification code. Please try again.";
        if (error instanceof FirebaseError) {
            errorMessage = formatFirebaseError(error) || errorMessage;
            return throwError(
                () => new AuthenticationError(errorMessage, AuthenticationErrorCode.FIREBASE_ERROR),
            );
        }
        return throwError(
            () => new AuthenticationError(errorMessage, AuthenticationErrorCode.UNKNOWN_ERROR),
        );
    };

    private handleConfirmCodeVerificationError = (error: any): Observable<never> => {
        if (error instanceof AuthenticationError) return throwError(() => error);

        let errorMessage = "Failed to verify confirmation code. Please try again.";
        if (error instanceof FirebaseError) {
            errorMessage = formatFirebaseError(error) || errorMessage;
            return throwError(
                () => new AuthenticationError(errorMessage, AuthenticationErrorCode.FIREBASE_ERROR),
            );
        }
        return throwError(
            () => new AuthenticationError(errorMessage, AuthenticationErrorCode.UNKNOWN_ERROR),
        );
    };

    private handleEmailVerificationError = (error: any) => {
        LocalStorageService.remove(LOCAL_STORAGE_KEYS.verifyEmail);

        if (error instanceof AuthenticationError) return throwError(() => error);

        let errorMessage = "Failed to verify email. Please try again.";
        if (error instanceof FirebaseError) {
            errorMessage = formatFirebaseError(error) || errorMessage;
            return throwError(
                () => new AuthenticationError(errorMessage, AuthenticationErrorCode.FIREBASE_ERROR),
            );
        }
        return throwError(
            () => new AuthenticationError(errorMessage, AuthenticationErrorCode.UNKNOWN_ERROR),
        );
    };

    private handleEmailChangingError = (error: any) => {
        console.log("Error changing email", error);
        LocalStorageService.remove(LOCAL_STORAGE_KEYS.changeEmail);

        if (error instanceof AuthenticationError) return throwError(() => error);

        let errorMessage = "Failed to change email. Please try again.";
        if (error instanceof FirebaseError) {
            if (
                error?.code === "auth/requires-recent-login" ||
                error?.code === "auth/user-token-expired"
            ) {
                return throwError(
                    () =>
                        new AuthenticationError(
                            "Please login again to change your email.",
                            AuthenticationErrorCode.REAUTHENTICATE,
                        ),
                );
            }
            errorMessage = formatFirebaseError(error) || errorMessage;
            return throwError(
                () => new AuthenticationError(errorMessage, AuthenticationErrorCode.FIREBASE_ERROR),
            );
        }
        return throwError(
            () => new AuthenticationError(errorMessage, AuthenticationErrorCode.UNKNOWN_ERROR),
        );
    };

    private handleChangePhoneNumberError = (error: any) => {
        console.log("Error sending verification code to a new phone number", error);
        this.isChangePhoneNumberInProgress$.next(false);
        LocalStorageService.remove(LOCAL_STORAGE_KEYS.verificationId);
        LocalStorageService.remove(LOCAL_STORAGE_KEYS.phoneNumberForChanging);

        if (error instanceof AuthenticationError) return throwError(() => error);

        let errorMessage = "Failed to send verification code. Please try again.";
        if (error instanceof FirebaseError) {
            if (
                error?.code === "auth/requires-recent-login" ||
                error?.code === "auth/user-token-expired"
            ) {
                return throwError(
                    () =>
                        new AuthenticationError(
                            "Please login again to change your phone number.",
                            AuthenticationErrorCode.REAUTHENTICATE,
                        ),
                );
            }
            errorMessage = formatFirebaseError(error) || errorMessage;
            return throwError(
                () => new AuthenticationError(errorMessage, AuthenticationErrorCode.FIREBASE_ERROR),
            );
        }
        return throwError(
            () => new AuthenticationError(errorMessage, AuthenticationErrorCode.UNKNOWN_ERROR),
        );
    };

    private handleConfirmNewPhoneNumberError = (error: any) => {
        console.log("Error confirming new phone number", error);
        this.isConfirmInProgress$.next(false);

        if (error instanceof AuthenticationError) {
            if (
                error.code === AuthenticationErrorCode.REAUTHENTICATE ||
                error.code === AuthenticationErrorCode.INVALID_CREDENTIALS
            ) {
                LocalStorageService.remove(LOCAL_STORAGE_KEYS.verificationId);
                LocalStorageService.remove(LOCAL_STORAGE_KEYS.phoneNumberForChanging);
            }
            return throwError(() => error);
        }

        let errorMessage = "Failed to confirm new phone number. Please try again.";
        if (error instanceof FirebaseError) {
            errorMessage = formatFirebaseError(error) || errorMessage;
            return throwError(
                () => new AuthenticationError(errorMessage, AuthenticationErrorCode.FIREBASE_ERROR),
            );
        }
        return throwError(
            () => new AuthenticationError(errorMessage, AuthenticationErrorCode.UNKNOWN_ERROR),
        );
    };

    private handlePhoneNumberVoipValidation = (isValid: boolean): Observable<boolean> => {
        if (!isValid) {
            return throwError(
                () =>
                    new AuthenticationError(
                        "Please enter a valid mobile number. Landlines, VoIP and temporary numbers are not supported.",
                        AuthenticationErrorCode.INVALID_CREDENTIALS,
                    ),
            );
        }
        return of(isValid);
    }
}
