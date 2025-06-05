export class LocalStorageService {
    /**
     * Save a value to localStorage
     * @param key The storage key
     * @param value The value to store (will be JSON-stringified)
     */
    static set<T>(key: string, value: T): void {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error saving to localStorage key "${key}":`, error);
        }
    }

    /**
     * Get a value from localStorage
     * @param key The storage key
     * @returns Parsed value or null if not found or invalid
     */
    static get<T>(key: string): T | null {
        try {
            const item = localStorage.getItem(key);
            return item ? (JSON.parse(item) as T) : null;
        } catch (error) {
            console.error(`Error reading from localStorage key "${key}":`, error);
            return null;
        }
    }

    /**
     * Remove an item from localStorage
     * @param key The storage key
     */
    static remove(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing localStorage key "${key}":`, error);
        }
    }

    /**
     * Clear all localStorage data
     */
    static clear(): void {
        try {
            localStorage.clear();
        } catch (error) {
            console.error("Error clearing localStorage:", error);
        }
    }

    /**
     * Check if a key exists
     * @param key The storage key
     */
    static has(key: string): boolean {
        return localStorage.getItem(key) !== null;
    }
}

export const LOCAL_STORAGE_KEYS = {
    changeEmail: 'change_email',
    verifyEmail: 'verify_email',
    phoneNumberForChanging: 'phone_number_for_changing',
    personalInfoPopupShown: 'personal_info_popup_shown',
    verificationId: 'verification_id',
}
