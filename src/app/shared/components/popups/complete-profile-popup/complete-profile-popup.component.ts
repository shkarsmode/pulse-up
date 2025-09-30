import { Component, inject, signal } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { UserService } from "@/app/shared/services/api/user.service";
import { CloseButtonComponent } from "../../ui-kit/buttons/close-button/close-button.component";
import { atLeastOneLetterValidator } from "@/app/shared/helpers/validators/at-least-one-letter.validator";
import { usernameUniqueValidator } from "@/app/shared/helpers/validators/username-unique.validator";
import { PrimaryButtonComponent } from "../../ui-kit/buttons/primary-button/primary-button.component";
import { InputComponent } from "../../ui-kit/input/input.component";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { ProfileService } from "@/app/shared/services/profile/profile.service";

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
    selector: "app-complete-profile-popup",
    standalone: true,
    imports: [
        CommonModule,
        CloseButtonComponent,
        ReactiveFormsModule,
        InputComponent,
        PrimaryButtonComponent,
    ],
    templateUrl: "./complete-profile-popup.component.html",
    styleUrl: "./complete-profile-popup.component.scss",
})
export class CompleteProfilePopupComponent {
    private router: Router = inject(Router);
    private fb: FormBuilder = inject(FormBuilder);
    private profileService = inject(ProfileService);
    private userService: UserService = inject(UserService);
    private readonly dialogRef: MatDialogRef<CompleteProfilePopupComponent> = inject(MatDialogRef);

    public form: FormGroup;
    public loading = signal(false);
    public errorMessage = signal<string | null>(null);

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
                [usernameUniqueValidator(this.userService.validateUsername, "")],
            ],
        });

        this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
            this.errorMessage.set(null);
        });
    }

    onBlur(name: string) {
        const control = this.form.get(name);
        if (control) {
            control.markAsTouched();
        }
    }

    async submit() {
        if (this.form.valid) {
            this.loading.set(true);
            try {
                const profile = await this.profileService.updateProfile(this.form.value);
                this.loading.set(false);
                this.dialogRef.close(profile);
                this.router.navigate([AppRoutes.User.Topic.SUGGEST]);
            } catch (error: unknown) {
                console.log("Error updating profile:", error);
                this.loading.set(false);
                this.errorMessage.set("Failed to update profile. Please try again.");
            }
        } else {
            this.form.markAllAsTouched();
        }
    }

    public onCloseDialog(): void {
        this.dialogRef.close();
    }

    public getErrorMessage(name: string): string | null {
        const control = this.form.get(name);
        if (!control) return null;
        return ErrorMessageBuilder.getErrorMessage(control, name);
    }
}
