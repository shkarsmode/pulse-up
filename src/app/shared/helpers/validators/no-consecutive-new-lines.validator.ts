import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function noConsecutiveNewlinesValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;

        if (typeof value === "string" && value.includes("\n\n\n")) {
            return {
                noConsecutiveNewlines: "Description cannot contain multiple consecutive new lines.",
            };
        }

        return null;
    };
}
