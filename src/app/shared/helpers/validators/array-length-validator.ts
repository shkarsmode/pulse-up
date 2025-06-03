import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function arrayLengthValidator(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        if (!Array.isArray(value)) return null;

        const length = value.length;
        if (length < min) return { minLengthArray: { requiredLength: min, actualLength: length } };
        if (length > max) return { maxLengthArray: { requiredLength: max, actualLength: length } };

        return null;
    };
}
