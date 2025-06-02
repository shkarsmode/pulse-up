import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from "@angular/forms";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";
import { InputComponent } from "@/app/shared/components/ui-kit/input/input.component";
import { ProfileLayoutComponent } from "../../ui/profile-layout/profile-layout.component";
import { PrimaryButtonComponent } from "../../../../shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { ErrorMessageBuilder } from "../../helpers/error-message-builder";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { RecentLoginRequiredError } from "../../helpers/change-email-error";
import { SigninRequiredPopupComponent } from "@/app/shared/components/popups/signin-required-popup/signin-required-popup.component";

@Component({
    selector: "app-change-email",
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputComponent,
        ProfileLayoutComponent,
        PrimaryButtonComponent,
    ],
    templateUrl: "./change-email.component.html",
    styleUrl: "./change-email.component.scss",
})
export class ChangeEmailComponent {
    private fb: FormBuilder = inject(FormBuilder);
    private router: Router = inject(Router);
    private dialog: MatDialog = inject(MatDialog);
    private authenticationService: AuthenticationService = inject(AuthenticationService);

    public form: FormGroup;
    public submitting: boolean = false;
    public errorMessage: string | null = null;
    private firebaseUser = this.authenticationService.firebaseAuth.currentUser;
    private initialEmail: string = this.firebaseUser?.email || "";

    constructor() {
        this.form = this.fb.group({
            email: [this.firebaseUser?.email || "", [Validators.required, Validators.email]],
        });
        this.form.valueChanges.subscribe(() => {
            this.errorMessage = null;
        });
    }

    public get disabled(): boolean {
        return (
            this.form.invalid || this.submitting || this.emailControl?.value === this.initialEmail
        );
    }

    public get hasErrorClass(): boolean {
        return !!(this.form.get("name")?.touched && this.form.get("name")?.invalid);
    }

    public get isUserVerified(): boolean {
        const user = this.authenticationService.firebaseAuth.currentUser;
        return !!(user?.email && user?.emailVerified)
    }

    private get emailControl(): AbstractControl<any, any> | null {
        return this.form.get("email");
    }

    public getErrorMessage(): string | null {
        if (!this.emailControl) return null;
        return ErrorMessageBuilder.getErrorMessage(this.emailControl, "email");
    }

    public onSubmit(): void {
        if (this.form.invalid || this.submitting) {
            return;
        }

        this.submitting = true;
        this.errorMessage = null;

        const hasEmail = this.firebaseUser?.email && this.firebaseUser?.emailVerified;
        const action = hasEmail ? "changeEmail" : "verifyEmail";

        this.authenticationService
            .changeEmail({
                email: this.emailControl?.value,
                continueUrl:
                    window.location.origin +
                    `/profile/verify-email?action=${action}&showPopup=true`,
            })
            .subscribe({
                next: () => {
                    this.submitting = false;
                    this.router.navigateByUrl(
                        `/${AppRoutes.Profile.VERIFY_EMAIL}?action=${action}`,
                        { replaceUrl: true },
                    );
                },
                error: (error) => {
                    this.submitting = false;

                    if (error instanceof RecentLoginRequiredError) {
                        this.dialog.open(SigninRequiredPopupComponent, {
                            width: "500px",
                            panelClass: "custom-dialog-container",
                            backdropClass: "custom-dialog-backdrop",
                        });
                        return;
                    }

                    this.errorMessage =
                        error.message ||
                        "An error occurred while changing the email. Please try again.";
                },
            });
    }
}
