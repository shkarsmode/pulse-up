import { AbstractControl } from "@angular/forms";

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
      required: 'This field is required',
      email: 'Enter a valid email address',
    }
  }
}