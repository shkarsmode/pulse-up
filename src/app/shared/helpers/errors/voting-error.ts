export enum VotingErrorCode {
    NOT_AUTHORIZED = "voting/not-authorized",
    GEOLOCATION_NOT_GRANTED = "voting/geolocation-not-granted",
    UNKNOWN_ERROR = "voting/unknown-error",
}

export class VotingError extends Error {
    code: VotingErrorCode;
    constructor(message: string, code: VotingErrorCode) {
        super(message);
        this.name = "VotingError";
        this.code = code;
        Object.setPrototypeOf(this, VotingError.prototype);
    }
}
