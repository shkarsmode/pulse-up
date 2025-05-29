import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '@/app/shared/components/ui-kit/input/input.component';
import { atLeastOneLetterValidator } from '@/app/shared/helpers/validators/at-least-one-letter.validator';
import { usernameUniqueValidator } from '@/app/shared/helpers/validators/username-unique.validator';
import { UserService } from '@/app/shared/services/api/user.service';
import { PrimaryButtonComponent } from '@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component';
import { TextareaComponent } from '@/app/shared/components/ui-kit/textarea/textarea.component';
import { PicturePickerComponent } from '@/app/shared/components/ui-kit/picture-picker/picture-picker.component';
import { pictureValidator } from '@/app/shared/helpers/validators/picture.validator';
import { optionalLengthValidator } from '@/app/shared/helpers/validators/optional-length.validator';

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, TextareaComponent, PrimaryButtonComponent, PicturePickerComponent],
  templateUrl: './profile-form.component.html',
  styleUrl: './profile-form.component.scss'
})
export class ProfileFormComponent {
  private fb: FormBuilder = inject(FormBuilder);
  private userService: UserService = inject(UserService);

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
        [usernameUniqueValidator(this.userService.validateUsername.bind(this.userService))],
      ],
      bio: [
        '',
        [
          optionalLengthValidator(3, 150),
        ]
      ],
      picture: [null, [pictureValidator()]]
    });

    this.form.valueChanges.subscribe(() => {
      this.errorMessage = null;
    })
  }

  public isDisabled(): boolean {
    if (this.loading) return true;
    if (this.form.invalid) return true;
    if (!this.form.invalid && this.form.status === "PENDING") return true;
    if (!this.form.get("name")?.dirty || !this.form.get("username")?.dirty) return true;
    return false;
  }

  public onBlur(name: string) {
    const control = this.form.get(name);
    if (control) {
      control.markAsTouched();
    }
  }

  public submit() {
    if (this.form.valid) {
      this.trimBioValue();
      this.loading = true;
      this.userService.updateOwnProfile(this.form.value).subscribe({
        next: () => {
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'Failed to update profile. Please try again.';
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  public getNameErrorMessage(): string | null {
    const control = this.form.get('name');
    if (!control || !(control.touched || control.dirty) || control.valid) {
      return null;
    }

    if (control.hasError('required')) {
      return 'Name is required';
    }
    if (control.hasError('maxlength')) {
      return 'Name must be 50 characters or less';
    }
    if (control.hasError('pattern')) {
      return 'Name must contain only letters';
    }

    return null;
  }

  public getUsernameErrorMessage(): string | null {
    const control = this.form.get('username');
    if (!control || !(control.touched || control.dirty) || control.valid) {
      return null;
    }

    if (control.hasError('required')) {
      return 'Username is required';
    }
    if (control.hasError('minlength')) {
      return 'Username must be at least 6 characters long';
    }
    if (control.hasError('maxlength')) {
      return 'Username must be 50 characters or less';
    }
    if (control.hasError('pattern')) {
      return 'Username must be alphanumeric and can include one underscore';
    }
    if (control.hasError('noLetter')) {
      return 'Must contain at least one letter.';
    }
    if (control.hasError('notUnique')) {
      return 'Username already taken.';
    }

    return null;
  }

  public getBioErrorMessage(): string | null {
    const control = this.form.get('bio');
    if (!control || !(control.touched || control.dirty) || control.valid) {
      return null;
    }

    if (control.hasError('required')) {
      return 'Bio is required';
    }
    if (control.hasError('minlength')) {
      return 'Bio must be at least 3 characters long';
    }
    if (control.hasError('maxlength')) {
      return 'Bio must be 150 characters or less';
    }

    return null;
  }

  public getPictureErrorMessage(): string | null {
    const control = this.form.get('picture');
    if (!control || !control?.value) {
      return null;
    }

    if (control.hasError('missingName')) {
      return 'Picture must have a name';
    }
    if (control.hasError('invalidType')) {
      return 'File must be an image';
    }
    if (control.hasError('invalidExtension')) {
      return 'Only .png, .jpg, .jpeg allowed';
    }
    if (control.hasError('fileTooLarge')) {
      return 'File must be smaller than 10 MB';
    }

    return null;
  }

  private trimBioValue() {
    const control = this.form.get('name');
    if (typeof control?.value !== 'string') return;

    const original = control.value;
    const trimmed = original
      .replace(/\n{2,}/g, '\n') // reduce multiple \n to one
      .replace(/[ \t]+/g, ' ')  // remove extra spaces and tabs
      .trim();

    this.form.patchValue({ bio: trimmed });
  }
}
