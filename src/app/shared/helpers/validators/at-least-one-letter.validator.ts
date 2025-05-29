import { AbstractControl, ValidationErrors } from "@angular/forms";

export function atLeastOneLetterValidator() {
  return (control: AbstractControl): ValidationErrors | null => {
    return /^[^a-zA-Z]*$/.test(control.value)
      ? { noLetter: 'Username must contain at least one letter.' }
      : null;
  };
}