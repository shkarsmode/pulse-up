

export enum AuthenticationErrorCode {
    INVALID_CREDENTIALS = "auth/invalid-credentials",
    INVALID_RECAPTCHA = "auth/invalid-recaptcha",
    INVALID_VERIFICATION_CODE = "auth/invalid-verification-code",
    FIREBASE_ERROR = "auth/firebase-error",
    REAUTHENTICATE = "auth/reauthenticate",
    INTERBAL_SERVER_ERROR = "auth/server-error",
    UNKNOWN_ERROR = "auth/unknown-error",
}

export class AuthenticationError extends Error {
    code: AuthenticationErrorCode;
    constructor(message: string, code: AuthenticationErrorCode) {
        super(message);
        this.name = "AuthenticationError";
        this.code = code;
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}