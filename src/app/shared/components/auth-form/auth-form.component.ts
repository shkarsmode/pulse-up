import {
    AfterViewInit,
    Component,
    DestroyRef,
    EventEmitter,
    inject,
    OnDestroy,
    Output,
    ViewChild,
} from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { ErrorStateMatcher } from "@angular/material/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { NotificationService } from "@/app/shared/services/core/notification.service";
import { SignInFormService } from "@/app/shared/services/core/sign-in-form.service";
import { isErrorWithMessage } from "../../helpers/errors/is-error-with-message";

@Component({
    selector: "app-auth-form",
    standalone: true,
    imports: [MatInputModule, MatFormFieldModule, ReactiveFormsModule, PrimaryButtonComponent],
    templateUrl: "./auth-form.component.html",
    styleUrl: "./auth-form.component.scss",
})
export class AuthFormComponent implements AfterViewInit, OnDestroy {
    private destroyRef = inject(DestroyRef);
    private signInFormService = inject(SignInFormService);
    private readonly notificationService = inject(NotificationService);
    public readonly isLoading = toSignal(this.signInFormService.isSigninInProgress);

    @Output() submitForm = new EventEmitter<void>();
    @ViewChild("telInput") telInput: { nativeElement: HTMLInputElement };

    constructor() {
        this.signInFormService.initialize();
    }

    ngAfterViewInit(): void {
        this.signInFormService.onViewInit(this.telInput.nativeElement);
    }

    ngOnDestroy(): void {
        this.signInFormService.onDestroy();
    }

    public get signInForm(): FormGroup {
        return this.signInFormService.form;
    }
    public get errorStateMatcher(): ErrorStateMatcher {
        return this.signInFormService.errorStateMatcher;
    }

    public async onSubmit() {
        try {
            await this.signInFormService.submit();
            this.submitForm.emit();
        } catch (error) {
            console.log("Error sending verification code:", error);
            if (isErrorWithMessage(error)) {
                this.notificationService.error(error.message);
            } else {
                this.notificationService.error(
                    "Failed to send verification code. Please try again.",
                );
            }
        }
    }

    public onFocus() {
        this.telInput.nativeElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
        });
    }
}
