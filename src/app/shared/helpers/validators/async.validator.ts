import { AbstractControl, AsyncValidatorFn, ValidationErrors } from "@angular/forms";
import { debounceTime, first, map, Observable, of, switchMap } from "rxjs";

export function asyncValidator({
    error,
    validationFn,
    initialValue,
}: {
    validationFn: (value: string) => Observable<boolean>;
    error: ValidationErrors;
    initialValue?: string;
}): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        const value = control.value;
        if (!value || (initialValue && value === initialValue)) {
            return of(null);
        }
        return of(control.value).pipe(
            debounceTime(300),
            switchMap((value) => validationFn(value)),
            map((res) => {
                return res ? null : error;
            }),
            first(),
        );
    };
}
