import { AbstractControl } from "@angular/forms";
import { min } from "rxjs";

export class ErrorMessageBuilder {
    public static getErrorMessage(control: AbstractControl<any, any>, name: string): string | null {
        if (!control || !(control.touched || control.dirty) || control.valid) {
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
        email: {
            required: "This field is required",
            email: "Enter a valid email address",
        },
        name: {
            required: "Name is required",
            maxlength: "Name cannot exceed 50 characters",
            pattern: "Name must contain only letters",
        },
        username: {
          required: "Username is required",
          minlength: "Username must be at least 6 characters long",
          maxlength: "Username cannot exceed 50 characters",
          pattern: "Username must be alphanumeric and can include one underscore",
          noLetter: "Username must contain at least one letter",
          notUnique: "Username is already taken",
        },
        bio: {
          required: "Bio is required",
          minlength: "Bio must be at least 3 characters long",
          maxlength: "Bio cannot exceed 150 characters",
        },
        profilePicture: {
          missingName: "Picture must have a name",
          invalidType: "File must be an image",
          invalidExtension: "Only .png, .jpg, .jpeg allowed",
          fileTooLarge: "File must be smaller than 10 MB",
        }
    };
}
