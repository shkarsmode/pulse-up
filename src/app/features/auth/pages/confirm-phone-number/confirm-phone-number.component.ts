import {
    AfterViewInit,
    Component,
    DestroyRef,
    inject,
    OnDestroy,
    OnInit,
    ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { Subscription } from "rxjs";
import { NgOtpInputComponent, NgOtpInputModule } from "ng-otp-input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { AuthLayoutComponent } from "../../ui/auth-layout/auth-layout.component";
import { LinkButtonComponent } from "@/app/shared/components/ui-kit/buttons/link-button/link-button.component";
import { LocalStorageService } from "@/app/shared/services/core/local-storage.service";
import { ConfirmPhoneNumberService } from "@/app/shared/services/core/confirm-phone-number.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

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
        AuthLayoutComponent,
        LinkButtonComponent,
    ],
    providers: [ConfirmPhoneNumberService],
})
export class ConfirmPhoneNumberComponent implements OnInit, AfterViewInit, OnDestroy {
    private readonly destroyed: DestroyRef = inject(DestroyRef);
    private readonly confirmPhoneNumberService: ConfirmPhoneNumberService =
        inject(ConfirmPhoneNumberService);

    @ViewChild(NgOtpInputComponent, { static: false }) ngOtpInput: NgOtpInputComponent;

    public cooldown = 0;
    public code = this.confirmPhoneNumberService.value;
    public config = this.confirmPhoneNumberService.otpInputConfig;
    public isVerifyingCode = this.confirmPhoneNumberService.isVerifyingCode;
    public isResendingCode = this.confirmPhoneNumberService.isResendingCode$.asObservable();
    private savedPhoneNumber: string = LocalStorageService.get("phoneNumberForSignin") || "";
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
            mode: "signIn",
        });
        this.code.valueChanges.pipe(takeUntilDestroyed(this.destroyed)).subscribe((value) => {
            this.confirmPhoneNumberService.onConfirmationCodeChange(value || "");
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

    public resendCode(): void {
        this.confirmPhoneNumberService.resendCode();
    }
}
