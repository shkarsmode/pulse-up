import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function pictureValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;

        // Allow empty – об этом уже заботится Validators.required
        if (!value) {
            return null;
        }

        // In edit mode we may have a string URL from backend ("/icons/xyz.png")
        // Treat it as already validated.
        if (typeof value === "string") {
            return null;
        }

        const file = value as File;

        const validExtensions = [".png", ".jpeg", ".jpg"];
        const maxSizeInBytes = 10 * 1024 * 1024; // 10 MB

        const hasName = typeof file.name === "string" && file.name.length > 0;
        const hasType = typeof file.type === "string" && file.type.length > 0;
        const hasSize = typeof file.size === "number";

        const nameValid = hasName;
        const typeValid = hasType && file.type.startsWith("image/");
        const extensionValid =
            hasName &&
            validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
        const sizeValid = hasSize && file.size < maxSizeInBytes;

        const errors: ValidationErrors = {
            missingName: !nameValid,
            invalidType: !typeValid,
            invalidExtension: !extensionValid,
            fileTooLarge: !sizeValid,
        };

        const hasAnyError = Object.values(errors).some(Boolean);

        return hasAnyError ? errors : null;
    };
}
