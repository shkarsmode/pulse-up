import {
    AfterViewInit,
    Component,
    DestroyRef,
    inject,
    OnDestroy,
    OnInit,
    ViewChild,
} from "@angular/core";
import { CommonModule, Location } from "@angular/common";
import { Router } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";
import { Subscription } from "rxjs";
import { NgOtpInputComponent, NgOtpInputModule } from "ng-otp-input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatDialog } from "@angular/material/dialog";
import {
    LOCAL_STORAGE_KEYS,
    LocalStorageService,
} from "@/app/shared/services/core/local-storage.service";
import { ConfirmPhoneNumberService } from "@/app/shared/services/core/confirm-phone-number.service";
import { LinkButtonComponent } from "@/app/shared/components/ui-kit/buttons/link-button/link-button.component";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { NotificationService } from "@/app/shared/services/core/notification.service";
import { AuthenticationError, AuthenticationErrorCode } from "@/app/shared/helpers/errors/authentication-error";
import { SigninRequiredPopupComponent } from "@/app/shared/components/popups/signin-required-popup/signin-required-popup.component";
import { isErrorWithMessage } from "@/app/shared/helpers/errors/is-error-with-message";

@Component({
    selector: "app-confirm-phone-number",
    templateUrl: "./confirm-phone-number.component.html",
    styleUrl: "./confirm-phone-number.component.scss",
    standalone: true,
    imports: [
        NgOtpInputModule,
        CommonModule,
        MatProgressSpinnerModule,
        ReactiveFormsModule,
        LinkButtonComponent,
    ],
    providers: [ConfirmPhoneNumberService],
})
export class ConfirmPhoneNumberComponent implements OnInit, AfterViewInit, OnDestroy {
    private readonly router = inject(Router);
    private readonly location = inject(Location);
    private readonly dialog = inject(MatDialog);
    private readonly destroyed: DestroyRef = inject(DestroyRef);
    private readonly confirmPhoneNumberService: ConfirmPhoneNumberService =
        inject(ConfirmPhoneNumberService);
    private readonly notificationService = inject(NotificationService);

    @ViewChild(NgOtpInputComponent, { static: false }) ngOtpInput: NgOtpInputComponent;

    public cooldown = 0;
    public code = this.confirmPhoneNumberService.value;
    public config = this.confirmPhoneNumberService.otpInputConfig;
    public isVerifyingCode = this.confirmPhoneNumberService.isVerifyingCode;
    public isResendingCode = this.confirmPhoneNumberService.isResendingCode$.asObservable();
    private savedPhoneNumber: string =
        LocalStorageService.get(LOCAL_STORAGE_KEYS.phoneNumberForSigning) || "";
    private cooldownSub?: Subscription;

    public get phoneNumber(): string {
        const value = this.savedPhoneNumber.toString();
        return value ? value.slice(0, -4).replace(/./g, "*") + value.slice(-4) : "";
    }

    public get isResendAvailable(): boolean {
        return this.cooldown <= 0 && this.confirmPhoneNumberService.resendCodeAttemptsLeft > 0;
    }

    public get isResendCodeHintVisible(): boolean {
        return this.confirmPhoneNumberService.resendCodeAttemptsLeft < 2;
    }

    public get resendCodeHint(): string {
        if (this.cooldown > 0 && this.confirmPhoneNumberService.resendCodeAttemptsLeft > 0) {
            return `Resend code in ${this.cooldown} seconds`;
        } else if (this.confirmPhoneNumberService.resendCodeAttemptsLeft === 1) {
            return "1 attempt remaining";
        } else {
            return "No more attempts available";
        }
    }

    ngOnInit() {
        this.confirmPhoneNumberService.initialize({
            mode: "changePhoneNumber",
        });
        this.code.valueChanges.pipe(takeUntilDestroyed(this.destroyed)).subscribe((value) => {
            this.confirmPhoneNumberService.onConfirmationCodeChange(value || "").subscribe({
                next: (result) => {
                    if (result) {
                        this.router.navigateByUrl(`/${AppRoutes.Profile.EDIT}`);
                        this.notificationService.success(
                            "Phone number has been changed successfully.",
                        );
                    }
                },
                error: this.handleError,
            });
        });
        this.cooldownSub = this.confirmPhoneNumberService.cooldown$.subscribe((seconds) => {
            this.cooldown = seconds;
        });
    }

    ngAfterViewInit(): void {
        this.confirmPhoneNumberService.onAfterViewInit(this.ngOtpInput);
    }

    ngOnDestroy() {
        this.cooldownSub?.unsubscribe();
    }

    resendCode(): void {
        this.confirmPhoneNumberService.resendCode();
    }

    private handleError = (error: unknown) => {
        if (error instanceof AuthenticationError) {
            if (
                error.code === AuthenticationErrorCode.INVALID_CREDENTIALS ||
                error.code === AuthenticationErrorCode.INVALID_RECAPTCHA
            ) {
                this.location.back();
            } else if (error.code === AuthenticationErrorCode.REAUTHENTICATE) {
                this.dialog.open(SigninRequiredPopupComponent, {
                    width: "500px",
                    panelClass: "custom-dialog-container",
                    backdropClass: "custom-dialog-backdrop",
                });
                return;
            }
        }
        const message = isErrorWithMessage(error)
            ? error.message
            : "Failed to confirm phone number. Please try again.";
        this.notificationService.error(message);
    };
}
