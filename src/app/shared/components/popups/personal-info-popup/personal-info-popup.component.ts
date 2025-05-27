import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AbstractControl, AsyncValidatorFn, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { debounceTime, first, map, Observable, of, switchMap } from 'rxjs';
import { InputComponent } from '../../ui-kit/input/input.component';
import { CloseButtonComponent } from '../../ui-kit/buttons/close-button/close-button.component';
import { PrimaryButtonComponent } from "../../ui-kit/buttons/primary-button/primary-button.component";
import { UserService } from '@/app/shared/services/api/user.service';

@Component({
  selector: 'app-personal-info-popup',
  templateUrl: './personal-info-popup.component.html',
  styleUrl: './personal-info-popup.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    CloseButtonComponent,
    ReactiveFormsModule,
    InputComponent,
    PrimaryButtonComponent,
    PrimaryButtonComponent,
  ],
})
export class PersonalInfoPopupComponent {
  private fb: FormBuilder = inject(FormBuilder);
  private userService: UserService = inject(UserService);
  private dialogRef: MatDialogRef<any> = inject(MatDialogRef);

  public form: FormGroup;
  public loading: boolean = false;
  public errorMessage: string | null = null;

  constructor() {
    this.form = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(50),
          Validators.pattern(/^[A-Za-z\s']+$/),
        ],
      ],
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(50),
          Validators.pattern(/^(?!.*__)(?:[A-Za-z0-9]*_?[A-Za-z0-9]*)$/),
          this.atLeastOneLetterValidator(),
        ],
        [this.usernameUniqueValidator()],
      ],
    });

    this.form.valueChanges.subscribe(() => {
      this.errorMessage = null;
    })
  }

  onBlur(name: string) {
    const control = this.form.get(name);
    if (control) {
      control.markAsTouched();
    }
  }

  submit() {
    if (this.form.valid) {
      this.loading = true;
      this.userService.updateOwnProfile(this.form.value).subscribe({
        next: (res) => {
          this.loading = false;
          this.dialogRef.close(res);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = 'Failed to update profile. Please try again.';
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCloseDialog() {
    this.dialogRef.close();
  }

  private atLeastOneLetterValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      return /^[^a-zA-Z]*$/.test(control.value)
        ? { noLetter: 'Username must contain at least one letter.' }
        : null;
    };
  }

  private usernameUniqueValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) return of(null);
      return of(control.value).pipe(
        debounceTime(300),
        switchMap((value) => this.userService.validateUsername(value)),
        map((res) =>
          res ? null : { notUnique: 'Username is already taken.' }
        ),
        first()
      );
    };
  }
}
