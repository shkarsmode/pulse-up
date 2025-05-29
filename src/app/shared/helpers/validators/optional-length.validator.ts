import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function optionalLengthValidator(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (typeof value !== 'string' || value.trim() === '') return null;

    const trimmed = value.trim();
    if (trimmed.length < min) {
      return { minlength: { requiredLength: min, actualLength: trimmed.length } };
    }
    if (trimmed.length > max) {
      return { maxlength: { requiredLength: max, actualLength: trimmed.length } };
    }

    return null;
  };
}
