import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { AppConstants } from "../../constants";

export function reservedKeywordsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value as string[];
        if (!Array.isArray(value)) return null;

        const reservedKeywords = AppConstants.DEFAULT_CATEGORIES;
        const invalidKeyword = value.find((keyword) =>
            reservedKeywords.includes(keyword.toLowerCase()),
        );
        return invalidKeyword
            ? {
                  reservedKeywords: `${invalidKeyword[0].toUpperCase() + invalidKeyword.slice(1)} is a reserved keyword. Please choose a different keyword.`,
              }
            : null;
    };
}
