import {
    Component,
    DestroyRef,
    EventEmitter,
    inject,
    Input,
    Output,
    ViewChild,
    OnInit,
    AfterViewInit,
    OnDestroy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NgOtpInputComponent, NgOtpInputModule } from "ng-otp-input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { ReactiveFormsModule } from "@angular/forms";
import { Subscription } from "rxjs";
import { LinkButtonComponent } from "../ui-kit/buttons/link-button/link-button.component";
import { ConfirmPhoneNumberService } from "../../services/core/confirm-phone-number.service";
import { LOCAL_STORAGE_KEYS, LocalStorageService } from "../../services/core/local-storage.service";

@Component({
    selector: "app-confirm-phone-number-form",
    standalone: true,
    imports: [
        NgOtpInputModule,
        ReactiveFormsModule,
        CommonModule,
        MatProgressSpinnerModule,
        LinkButtonComponent,
    ],
    templateUrl: "./confirm-phone-number-form.component.html",
    styleUrl: "./confirm-phone-number-form.component.scss",
})
export class ConfirmPhoneNumberFormComponent implements OnInit, AfterViewInit, OnDestroy {
    private readonly destroyed: DestroyRef = inject(DestroyRef);
    private readonly confirmPhoneNumberService: ConfirmPhoneNumberService =
        inject(ConfirmPhoneNumberService);

    @Input() mode: "signIn" | "changePhoneNumber" = "signIn";
    @Output() public codeConfiramSuccess = new EventEmitter<void>();
    @Output() public codeConfiramError = new EventEmitter<unknown>();
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
            mode: this.mode,
        });
        this.code.valueChanges.pipe(takeUntilDestroyed(this.destroyed)).subscribe((value) => {
            this.onCodeChanged(value || "");
        });
        this.cooldownSub = this.confirmPhoneNumberService.cooldown$.subscribe((seconds) => {
            this.cooldown = seconds;
        });
    }

    ngAfterViewInit(): void {
        this.confirmPhoneNumberService.onAfterViewInit(this.ngOtpInput);
        setTimeout(() => {
            this.ngOtpInput.focusTo(this.ngOtpInput.getBoxId(0));
        }, 200);
    }

    ngOnDestroy() {
        this.cooldownSub?.unsubscribe();
    }

    public resendCode(): void {
        this.confirmPhoneNumberService.resendCode();
    }

    private async onCodeChanged(value: string) {
        try {
            const isConfirmed =
                await this.confirmPhoneNumberService.onConfirmationCodeChange(value);
            if (isConfirmed) {
                this.codeConfiramSuccess.emit();
            }
        } catch (error) {
            this.codeConfiramError.emit(error);
        }
    }
}
