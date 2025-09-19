import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { StringUtils } from "../string-utils";

export function descriptionLengthValidator({
    min,
    max,
}: {
    min: number;
    max: number;
}): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;

        if (typeof value !== "string") return null;

        const crlfValue = StringUtils.toCRLF(value);

        if (crlfValue.length < min) {
            return { minlength: { requiredLength: min, actualLength: crlfValue.length } };
        }

        if (crlfValue.length > max) {
            return { maxlength: { requiredLength: max, actualLength: crlfValue.length } };
        }

        return null;
    };
}
