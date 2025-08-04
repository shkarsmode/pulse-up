import { AbstractControl, AsyncValidatorFn, ValidationErrors } from "@angular/forms";
import { catchError, debounceTime, first, map, Observable, of, switchMap } from "rxjs";
import { UsernameValidationResult } from "../../interfaces/user/username-validation-result.interface";

export function usernameUniqueValidator(
    validationFn: (username: string) => Observable<UsernameValidationResult>,
    initialValue: string,
): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        const value = control.value;
        if (!value || (initialValue && value === initialValue)) {
            return of(null);
        }
        return of(control.value).pipe(
            debounceTime(300),
            switchMap((value) => validationFn(value)),
            map((res) => {
                return res.success ? null : { custom: res.message };
            }),
            catchError((error) => {
                const errors = Object.values(error?.error?.errors);
                const errorMessage = errors.length > 0 ? errors[0] : "Username is not available";
                return of({ custom: errorMessage });
            }),
            first(),
        );
    };
}
