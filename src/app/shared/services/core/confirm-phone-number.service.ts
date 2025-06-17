import { inject } from "@angular/core";
import { BehaviorSubject, filter, interval, Subscription, switchMap, takeWhile, tap } from "rxjs";
import { Router } from "@angular/router";
import { FormControl } from "@angular/forms";
import { toSignal } from "@angular/core/rxjs-interop";
import { MatDialog } from "@angular/material/dialog";
import { NgOtpInputComponent, NgOtpInputConfig } from "ng-otp-input";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { UserStore } from "@/app/shared/stores/user.store";
import { NotificationService } from "./notification.service";
import {
    AuthenticationError,
    AuthenticationErrorCode,
} from "../../helpers/errors/authentication-error";
import { Location } from "@angular/common";
import { isErrorWithMessage } from "../../helpers/errors/is-error-with-message";
import { SigninRequiredPopupComponent } from "../../components/popups/signin-required-popup/signin-required-popup.component";

type ServiceWorkMode = "signIn" | "changePhoneNumber";

export class ConfirmPhoneNumberService {
    private dialog: MatDialog = inject(MatDialog);
    private readonly router: Router = inject(Router);
    private readonly location: Location = inject(Location);
    private readonly userStore: UserStore = inject(UserStore);
    private readonly notificationService: NotificationService = inject(NotificationService);
    private readonly authenticationService: AuthenticationService = inject(AuthenticationService);

    private appRoutes = AppRoutes;
    private ngOtpInput: NgOtpInputComponent;
    private countdown$ = new BehaviorSubject<number>(0);
    private timerSub: Subscription;
    private mode: ServiceWorkMode = "signIn";
    public resendCodeAttemptsLeft = 2;
    public value = new FormControl("");
    public readonly isVerifyingCode = toSignal(this.authenticationService.isConfirmInProgress$);
    public readonly isResendingCode$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        false,
    );
    public readonly otpInputConfig: NgOtpInputConfig = {
        length: 6,
        allowNumbersOnly: true,
        inputClass: "otp-custom-input",
        containerClass: "otp-custom-container",
    };

    get cooldown$() {
        return this.countdown$.asObservable();
    }

    public initialize({ mode = "signIn" }: { mode?: ServiceWorkMode } = {}) {
        this.mode = mode;
    }

    public onAfterViewInit(ngOtpInput: NgOtpInputComponent) {
        this.ngOtpInput = ngOtpInput;
    }

    public onConfirmationCodeChange = (value: string) => {
        if (value?.length !== 6) return;

        if (this.mode === "signIn") {
            this.authenticationService.confirmVerificationCode(value).pipe(
                switchMap(() => {
                    this.userStore.refreshProfile();
                    return this.userStore.profile$
                }),
                filter((profile) => !!profile),
            ).subscribe({
                next: () => {
                    this.navigateToHomePage();
                    this.resetInput();
                },
                error: this.handleEror,
            });
        } else {
            this.authenticationService.confirmNewPhoneNumber(value).subscribe({
                next: (response) => {
                    this.router.navigateByUrl(`/${this.appRoutes.Profile.EDIT}`);
                    this.notificationService.success("Phone number has been changed successfully.");
                },
                error: this.handleEror,
            });
        }
    };

    public resendCode = () => {
        if (
            this.resendCodeAttemptsLeft <= 0 ||
            this.isCooldownActive() ||
            this.isResendingCode$.value
        )
            return;
        this.isResendingCode$.next(true);
        this.resetInput();
        this.authenticationService.resendVerificationCode().subscribe({
            next: () => {
                console.log("Verification code resent successfully");
                this.resendCodeAttemptsLeft--;
                this.isResendingCode$.next(false);
                this.startCooldown(60);
            },
            error: this.handleEror,
        });
    };

    public startCooldown(seconds: number) {
        this.countdown$.next(seconds);
        this.timerSub?.unsubscribe();

        this.timerSub = interval(1000)
            .pipe(takeWhile(() => this.countdown$.value > 0))
            .subscribe(() => {
                this.countdown$.next(this.countdown$.value - 1);
            });
    }

    isCooldownActive(): boolean {
        return this.countdown$.value > 0;
    }

    getCurrentCountdown(): number {
        return this.countdown$.value;
    }

    stopCooldown() {
        this.timerSub?.unsubscribe();
        this.countdown$.next(0);
    }

    private resetInput() {
        this.value.setValue("");
        const eleId = this.ngOtpInput.getBoxId(0);
        this.ngOtpInput.focusTo(eleId);
    }

    private navigateToHomePage() {
        const redirectUrl = this.getRedirectUrl();
        const navigationUrl = redirectUrl || this.appRoutes.Landing.HOME;
        this.router.navigateByUrl(navigationUrl);
    }

    private getRedirectUrl(): string | null {
        const tree = this.router.parseUrl(this.router.url);
        return tree.queryParams["redirect"] || null;
    }

    private handleEror = (error: unknown) => {
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
        this.resetInput();
    };
}
