import { ChangeDetectionStrategy, Component, inject, Input, signal } from "@angular/core";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { ReactiveFormsModule } from "@angular/forms";
import { MatIconButton } from "@angular/material/button";
import { AuthFormService } from "./auth-form.service";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { IAuthMode } from "../../interface/auth-mode.interface";
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
    selector: "app-auth-form",
    standalone: true,
    imports: [
        MatInputModule,
        MatFormFieldModule,
        MatIconButton,
        ReactiveFormsModule,
        PrimaryButtonComponent,
        AngularSvgIconModule,
    ],
    providers: [AuthFormService],
    templateUrl: "./auth-form.component.html",
    styleUrl: "./auth-form.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthFormComponent {
    @Input() mode: IAuthMode = "sign-in";
    private authFormService = inject(AuthFormService);
    protected form = this.authFormService.form;
    protected isSubmitting = this.authFormService.isSubmitting;
    protected isVisiblePassword = signal(false);
    protected labels: Record<IAuthMode, string> = {
        "sign-in": "Sign In",
        "sign-up": "Sign Up",
    };

    protected get emailError() {
        const errors = this.authFormService.email.errors;
        return errors && Object.keys(errors).length
            ? this.mapErrorKeyToMessage(Object.keys(errors)[0])
            : "";
    }
    protected get passwordError() {
        const errors = this.authFormService.password.errors;
        return errors && Object.keys(errors).length
            ? this.mapErrorKeyToMessage(Object.keys(errors)[0])
            : "";
    }

    protected togglePasswordVisibility() {
        this.isVisiblePassword.update((value) => !value);
    }

    protected onSubmit() {
        this.authFormService.submit(this.mode);
    }

    private mapErrorKeyToMessage(key: string): string {
        const errorMessages: Record<string, string> = {
            required: "This field is required",
            email: "Please enter a valid email address",
            minlength: "Password must be at least 6 characters long",
            maxlength: "Password cannot exceed 20 characters",
        };
        return errorMessages[key] || "Invalid field";
    }
}
