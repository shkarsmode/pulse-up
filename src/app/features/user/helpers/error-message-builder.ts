import { AbstractControl } from "@angular/forms";

export const MAX_DESCRIPTION_LENGTH = 600;
export const MIN_DESCRIPTION_LENGTH = 150;
export const MIN_TITLE_LENGTH = 6;
export const MAX_TITLE_LENGTH = 60;

export class ErrorMessageBuilder {
    public static getErrorMessage(
        control: AbstractControl<string, string>,
        name: string,
    ): string | null {
        if (!control || !control.touched || control.valid) {
            return null;
        }

        const messages = this.errorMessages[name as keyof typeof this.errorMessages];

        if (!messages) return null;

        for (const [errorKey, message] of Object.entries(messages)) {
            if (control.hasError(errorKey)) {
                return message || (control.getError(errorKey) as string);
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
            minlength: `Headline must be at least ${MIN_TITLE_LENGTH} characters long`,
            maxlength: `Headline must be at most ${MAX_TITLE_LENGTH} characters long`,
            notUnique: "A topic with this name already exists. Please choose a different name.",
        },
        description: {
            required: "Description is required",
            minlength: `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters long`,
            maxlength: `Description must be at most ${MAX_DESCRIPTION_LENGTH} characters long`,
            noConsecutiveNewlines: "Description cannot contain consecutive newlines",
        },
        picture: {
            required: "Picture is required",
            missingName: "Picture must have a name",
            invalidType: "Picture must be an image",
            invalidExtension:
                "Picture must have one of the following extensions: .png, .jpg, .jpeg",
            fileTooLarge: "Picture must be less than 10 MB",
        },
        category: {
            required: "Category is required",
        },
        keywords: {
            required: "At least one keyword is required",
            minLengthArray: "At least one keyword is required",
            maxLengthArray: "You can add up to 3 keywords",
            keywordMatchesCategory: "Keywords cannot match the category",
            reservedKeywords: null,
        },
        location: {
            required: "Location is required",
        },
    };
}
