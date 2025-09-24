import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatDialogRef } from "@angular/material/dialog";
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from "@angular/forms";
import { take } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { UserService } from "@/app/shared/services/api/user.service";
import { atLeastOneLetterValidator } from "@/app/shared/helpers/validators/at-least-one-letter.validator";
import { usernameUniqueValidator } from "@/app/shared/helpers/validators/username-unique.validator";
import { ProfileService } from "@/app/shared/services/profile/profile.service";
import { CloseButtonComponent } from "@/app/shared/components/ui-kit/buttons/close-button/close-button.component";
import { InputComponent } from "@/app/shared/components/ui-kit/input/input.component";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";

export class ErrorMessageBuilder {
    public static getErrorMessage(
        control: AbstractControl<string, string>,
        name: string,
    ): string | null {
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

        if (control.errors) {
            const error = Object.values(control.errors)[0];
            return error || null;
        }

        return null;
    }

    private static errorMessages = {
        name: {
            required: "Name is required",
            maxlength: "Name cannot exceed 50 characters",
            pattern: "Name must contain only letters",
        },
        username: {
            required: "Username is required",
            minlength: "Username must be at least 6 characters long",
            maxlength: "Username cannot exceed 50 characters",
            pattern: "Username must be alphanumeric and can include one underscore",
            noLetter: "Username must contain at least one letter",
            notUnique: "Username is already taken",
        },
    };
}

@Component({
    selector: "app-personal-info-popup",
    templateUrl: "./personal-info-popup.component.html",
    styleUrl: "./personal-info-popup.component.scss",
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
    private profileService: ProfileService = inject(ProfileService);
    private userService: UserService = inject(UserService);
    private dialogRef: MatDialogRef<PersonalInfoPopupComponent> = inject(MatDialogRef);

    public form: FormGroup;
    public loading = false;
    public errorMessage: string | null = null;

    constructor() {
        this.form = this.fb.group({
            name: [
                "",
                [
                    Validators.required,
                    Validators.maxLength(50),
                    Validators.pattern(/^[A-Za-z\s']+$/),
                ],
            ],
            username: [
                "",
                [
                    Validators.required,
                    Validators.minLength(6),
                    Validators.maxLength(50),
                    Validators.pattern(/^(?!.*__)(?:[A-Za-z0-9]*_?[A-Za-z0-9]*)$/),
                    atLeastOneLetterValidator(),
                ],
                [
                    usernameUniqueValidator(
                        this.userService.validateUsername.bind(this.userService),
                        "",
                    ),
                ],
            ],
        });

        this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
            this.errorMessage = null;
        });
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
            this.profileService
                .updateProfile(this.form.value)
                .pipe(take(1))
                .subscribe({
                    next: (res) => {
                        this.loading = false;
                        this.dialogRef.close(res);
                    },
                    error: () => {
                        this.loading = false;
                        this.errorMessage = "Failed to update profile. Please try again.";
                    },
                });
        } else {
            this.form.markAllAsTouched();
        }
    }

    onCloseDialog() {
        this.dialogRef.close();
    }

    public getErrorMessage(name: string): string | null {
        const control = this.form.get(name);
        if (!control) return null;
        return ErrorMessageBuilder.getErrorMessage(control, name);
    }
}
