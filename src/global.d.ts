import { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";

export {};

declare global {
    interface Window {
        recaptchaVerifier?: RecaptchaVerifier;
        confirmationResult?: ConfirmationResult;
        recaptchaWidgetId?: string;
        grecaptcha?: {
            render: (element: string, options: { sitekey: string; callback: () => void }) => string;
            reset: (widgetId?: string) => void;
            execute: (widgetId?: string) => void;
            getResponse: (widgetId?: string) => string;
        };
    }
}
