import { AbstractControl, AsyncValidatorFn, ValidationErrors } from "@angular/forms";
import { debounceTime, first, map, Observable, of, switchMap } from "rxjs";

export function usernameUniqueValidator(validationFn: (username: string) => Observable<boolean>): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) return of(null);
    return of(control.value).pipe(
      debounceTime(300),
      switchMap((value) => validationFn(value)),
      map((res) =>
        res ? null : { notUnique: 'Username is already taken.' }
      ),
      first()
    );
  };
}