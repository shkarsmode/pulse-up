import { Component, inject } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { filter, take } from "rxjs";
import { UserService } from "@/app/shared/services/api/user.service";
import { CloseButtonComponent } from "../../ui-kit/buttons/close-button/close-button.component";
import { atLeastOneLetterValidator } from "@/app/shared/helpers/validators/at-least-one-letter.validator";
import { usernameUniqueValidator } from "@/app/shared/helpers/validators/username-unique.validator";
import { PrimaryButtonComponent } from "../../ui-kit/buttons/primary-button/primary-button.component";
import { InputComponent } from "../../ui-kit/input/input.component";
import { UserStore } from "@/app/shared/stores/user.store";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";

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
    private userStore: UserStore = inject(UserStore);
    private userService: UserService = inject(UserService);
    private readonly dialogRef: MatDialogRef<any> = inject(MatDialogRef);

    public form: FormGroup;
    public loading: boolean = false;
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
                [usernameUniqueValidator(this.userService.validateUsername, "")],
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
            this.userService
                .updateOwnProfile(this.form.value)
                .pipe(take(1))
                .subscribe({
                    next: (res) => {
                        this.loading = false;
                        this.dialogRef.close(res);
                        this.userStore.refreshProfile();
                        this.userStore.profile$
                            .pipe(filter((profile) => !!profile?.name && !!profile?.username))
                            .subscribe(() => {
                                this.router.navigate([AppRoutes.User.Topic.SUGGEST]);
                            });
                    },
                    error: (err) => {
                        this.loading = false;
                        this.errorMessage = "Failed to update profile. Please try again.";
                    },
                });
        } else {
            this.form.markAllAsTouched();
        }
    }

    public onCloseDialog(): void {
        this.dialogRef.close();
    }
}
