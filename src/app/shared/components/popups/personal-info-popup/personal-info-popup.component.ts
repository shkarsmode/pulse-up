import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../ui-kit/input/input.component';
import { CloseButtonComponent } from '../../ui-kit/buttons/close-button/close-button.component';
import { PrimaryButtonComponent } from "../../ui-kit/buttons/primary-button/primary-button.component";
import { UserService } from '@/app/shared/services/api/user.service';
import { atLeastOneLetterValidator } from '@/app/shared/helpers/validators/at-least-one-letter.validator';
import { usernameUniqueValidator } from '@/app/shared/helpers/validators/username-unique.validator';
import { UserStore } from '@/app/shared/stores/user.store';

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
  ],
})
export class PersonalInfoPopupComponent {
  private fb: FormBuilder = inject(FormBuilder);
  private userStore: UserStore = inject(UserStore);
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
          atLeastOneLetterValidator(),
        ],
        [usernameUniqueValidator(this.userService.validateUsername.bind(this.userService), "")],
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
          this.userStore.refreshProfile();
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
}
