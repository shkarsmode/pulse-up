import { inject, Injectable, Injector, signal } from "@angular/core";
import { AbstractControl, FormControl, FormGroup, Validators } from "@angular/forms";
import { AuthContextService } from "../../services/auth-context.service";
import { IAuthMode } from "../../interface/auth-mode.interface";
import { SignInService } from "../../services/sign-in.service";
import { SignUpService } from "../../services/sign-up.service";
import { Router } from "@angular/router";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { NotificationService } from "@/app/shared/services/core/notification.service";
import { isErrorWithMessage } from "@/app/shared/helpers/errors/is-error-with-message";

interface AuthForm {
    email: AbstractControl<string, string>;
    password: AbstractControl<string, string>;
}

@Injectable()
export class AuthFormService {
    private readonly injector = inject(Injector);
    private router = inject(Router);
    private authContextService = inject(AuthContextService);
    private notificationService = inject(NotificationService);
    private _isSubmitting = signal(false);
    public form: FormGroup<AuthForm>;
    public isSubmitting = this._isSubmitting.asReadonly();

    constructor() {
        this.form = new FormGroup<AuthForm>({
            email: new FormControl("", {
                nonNullable: true,
                validators: [Validators.required, Validators.email],
            }),
            password: new FormControl<string>("", {
                nonNullable: true,
                validators: [
                    Validators.required,
                    Validators.minLength(6),
                    Validators.maxLength(20),
                ],
            }),
        });
    }

    public get email() {
        return this.form.controls.email;
    }

    public get password() {
        return this.form.controls.password;
    }

    public async submit(mode: IAuthMode) {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        switch (mode) {
            case "sign-in":
                this.authContextService.setStrategy(this.injector.get(SignInService));
                break;
            case "sign-up":
                this.authContextService.setStrategy(this.injector.get(SignUpService));
                break;
            default:
                throw new Error("Invalid auth mode");
        }

        try {
            this._isSubmitting.set(true);
            await this.authContextService.authenticate(this.email.value, this.password.value);
            this.router.navigateByUrl(AppRoutes.Landing.HOME);
        } catch (error: unknown) {
            if (isErrorWithMessage(error)) {
                this.notificationService.error(error.message);
            } else {
                this.notificationService.error("Something went wrong. Please try again later.");
            }
        } finally {
            this._isSubmitting.set(false);
        }
    }
}
