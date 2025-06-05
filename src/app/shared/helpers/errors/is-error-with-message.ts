export const isErrorWithMessage = (error: unknown): error is Error => {
    return (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
    );
}