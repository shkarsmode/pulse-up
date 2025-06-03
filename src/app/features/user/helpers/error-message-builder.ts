import { AbstractControl } from "@angular/forms";
import { ca } from "intl-tel-input/i18n";

export class ErrorMessageBuilder {
    public static getErrorMessage(control: AbstractControl<any, any>, name: string): string | null {
        
        if (!control || !(control.touched) || control.valid) {
            return null;
        }

        const messages = this.errorMessages[name as keyof typeof this.errorMessages];

        if (!messages) return null;

        for (const [errorKey, message] of Object.entries(messages)) {
            if (control.hasError(errorKey)) {
                return message;
            }
        }

        return null;
    }

    private static errorMessages = {
        icon: {
            required: "Icon is required",
            missingName: "Icon must have a name",
            invalidType: "Icon must be an image",
            invalidExtension: "Icon must have one of the following extensions: .png, .jpg, .jpeg",
            fileTooLarge: "Icon must be less than 10 MB",
        },
        headline: {
            required: "Headline is required",
            minlength: "Headline must be at least 6 characters long",
            maxlength: "Headline must be at most 60 characters long",
            notUnique: "A topic with this name already exists. Please choose a different name.",
        },
        description: {
            required: "Description is required",
            minlength: "Description must be at least 150 characters long",
            maxlength: "Description must be at most 600 characters long",
            noConsecutiveNewlines: "Description cannot contain consecutive newlines",
        },
        category: {
            required: "Category is required",
        },
        keywords: {
            required: "At least one keyword is required",
            minLengthArray: "At least one keyword is required",
            maxLengthArray: "You can add up to 3 keywords",
        },
    };
}
