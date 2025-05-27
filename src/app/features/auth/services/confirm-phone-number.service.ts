import { inject } from "@angular/core";
import { BehaviorSubject, interval, Subscription, takeWhile } from "rxjs";
import { Router } from "@angular/router";
import { FormControl } from "@angular/forms";
import { toSignal } from "@angular/core/rxjs-interop";
import { NgOtpInputComponent, NgOtpInputConfig } from "ng-otp-input";
import { FirebaseError } from "firebase/app";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { formatFirebaseError } from "../utils/formatFirebaseError";

export class ConfirmPhoneNumberService {
  private readonly router: Router = inject(Router);
  private readonly authenticationService: AuthenticationService = inject(AuthenticationService);

  private appRoutes = AppRoutes;
  private ngOtpInput: NgOtpInputComponent;
  private countdown$ = new BehaviorSubject<number>(0);
  private timerSub: Subscription;
  public resendCodeAttemptsLeft = 2;
  public errorMessage$: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public value = new FormControl("");
  public readonly isVerifyingCode = toSignal(this.authenticationService.isConfirmInProgress$);
  public readonly isResendingCode$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public readonly otpInputConfig: NgOtpInputConfig = {
    length: 6,
    allowNumbersOnly: true,
    inputClass: "otp-custom-input",
    containerClass: "otp-custom-container",
  }

  get cooldown$() {
    return this.countdown$.asObservable();
  }

  public onAfterViewInit(ngOtpInput: NgOtpInputComponent) {
    this.ngOtpInput = ngOtpInput;
  }

  public onConfirmationCodeChange = (value: string) => {
    if (value && value.length > 0) {
      this.setErrorMessage("");
    }
    if (value?.length === 6) {
      this.authenticationService.confirmVerificationCode(value).subscribe({
        next: (response) => {
          console.log("Verification code confirmed successfully", response);
          this.navigateToHomePage();
          this.resetInput();
        },
        error: (error) => {
          console.error("Error confirming verification code", error);

          let errorMessage = "Invalid verification code. Please try again.";
          if (error instanceof FirebaseError) {
            errorMessage = formatFirebaseError(error) || errorMessage;
          }
          this.setErrorMessage(errorMessage);
          this.resetInput();
        },
      });
    }
  }

  public resendCode = () => {
    if (this.resendCodeAttemptsLeft <= 0 || this.isCooldownActive() || this.isResendingCode$.value) return;
    this.isResendingCode$.next(true);
    this.resetInput();
    this.setErrorMessage("");
    this.authenticationService.resendVerificationCode().subscribe({
      next: () => {
        console.log("Verification code resent successfully");
        this.resendCodeAttemptsLeft--;
        this.startCooldown(60);
      },
      error: (error) => {
        let errorMessage = "Failed to resend verification code. Please try again later.";
        if (error instanceof FirebaseError) {
          errorMessage = formatFirebaseError(error) || errorMessage;
        }
        this.setErrorMessage(errorMessage);
      },
      complete: () => {
        this.isResendingCode$.next(false);
      },
    })
  }

  public startCooldown(seconds: number) {
    this.countdown$.next(seconds);
    this.timerSub?.unsubscribe();

    this.timerSub = interval(1000).pipe(
      takeWhile(() => this.countdown$.value > 0)
    ).subscribe(() => {
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

  private setErrorMessage(message: string) {
    this.errorMessage$.next(message);
  }

  private resetInput() {
    this.value.setValue("");
    const eleId = this.ngOtpInput.getBoxId(0);
    this.ngOtpInput.focusTo(eleId);
  }

  private navigateToHomePage() {
    this.router.navigateByUrl(this.appRoutes.Landing.HOME);
  }
}