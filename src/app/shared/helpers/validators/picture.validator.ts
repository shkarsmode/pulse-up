
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function pictureValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file: File | null = control.value;

    if (!file) return null; // Allow null (no file yet)

    const validTypes = ['image/png', 'image/jpeg'];
    const validExtensions = ['.png', '.jpeg', '.jpg'];
    const maxSizeInBytes = 10 * 1024 * 1024; // 10 MB

    const nameValid = !!file.name;
    const typeValid = file.type.startsWith('image/');
    const extensionValid = validExtensions.some(ext =>
      file.name.toLowerCase().endsWith(ext)
    );
    const sizeValid = file.size < maxSizeInBytes;

    const errors: ValidationErrors = {
      missingName: !nameValid,
      invalidType: !typeValid,
      invalidExtension: !extensionValid,
      fileTooLarge: !sizeValid
    };

    return Object.values(errors).filter(Boolean).length > 0 ? errors : null;
  };
}
