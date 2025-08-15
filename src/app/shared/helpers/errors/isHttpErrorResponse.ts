import { HttpErrorResponse } from "@angular/common/http";

export const isHttpErrorResponse = (error: unknown): error is HttpErrorResponse => {
    return (
        typeof error === "object" &&
        error !== null &&
        "name" in error &&
        "status" in error &&
        (error).name === "HttpErrorResponse"
    );
}