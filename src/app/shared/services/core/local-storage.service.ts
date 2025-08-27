export const LOCAL_STORAGE_KEYS = {
    changeEmail: "change_email",
    verifyEmail: "verify_email",
    phoneNumberForSigning: "phone_number_for_signing",
    phoneNumberForChanging: "phone_number_for_changing",
    personalInfoPopupShown: "personal_info_popup_shown",
    personalInfoPopupShownForProfiles: "personal_info_popup_shown_for_profiles",
    verificationId: "verification_id",
    isAnonymous: "isAnonymous",
    anonymousToken: "anonymous",
    userToken: "userToken",
    howItWorksPageVisited: "how_it_works_page_visited",
    pendingTopics: "pending_topics",
    mapInfoTooltipClosed: "map_info_tooltip_closed",
} as const;

type LocalStorageKey = typeof LOCAL_STORAGE_KEYS[keyof typeof LOCAL_STORAGE_KEYS];

export class LocalStorageService {
    /**
     * Save a value to localStorage
     * @param key The storage key
     * @param value The value to store (will be JSON-stringified)
     */
    static set<T>(key: LocalStorageKey, value: T): void {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.log(`Error saving to localStorage key "${key}":`, error);
        }
    }

    /**
     * Get a value from localStorage
     * @param key The storage key
     * @returns Parsed value or null if not found or invalid
     */
    static get<T>(key: LocalStorageKey): T | null {
        try {
            const item = localStorage.getItem(key);
            return item ? (JSON.parse(item) as T) : null;
        } catch (error) {
            console.log(`Error reading from localStorage key "${key}":`, error);
            return null;
        }
    }

    /**
     * Remove an item from localStorage
     * @param key The storage key
     */
    static remove(key: LocalStorageKey): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.log(`Error removing localStorage key "${key}":`, error);
        }
    }

    /**
     * Clear all localStorage data
     */
    static clear(): void {
        try {
            localStorage.clear();
        } catch (error) {
            console.log("Error clearing localStorage:", error);
        }
    }

    /**
     * Check if a key exists
     * @param key The storage key
     */
    static has(key: LocalStorageKey): boolean {
        return localStorage.getItem(key) !== null;
    }
}
