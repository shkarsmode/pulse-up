export class RecentLoginRequiredError extends Error {
    constructor() {
        super("Recent login required to change email.");
        this.name = "RecentLoginRequiredError";
        Object.setPrototypeOf(this, RecentLoginRequiredError.prototype);
    }
}
