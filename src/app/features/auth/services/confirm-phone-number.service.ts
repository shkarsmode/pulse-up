import { inject } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Router } from "@angular/router";
import { FormControl } from "@angular/forms";
import { toSignal } from "@angular/core/rxjs-interop";
import { NgOtpInputComponent } from "ng-otp-input";
import { FirebaseError } from "firebase/app";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { formatFirebaseError } from "../utils/formatFirebaseError";

export class ConfirmPhoneNumberService {
  private readonly router: Router = inject(Router);
  private readonly authenticationService: AuthenticationService = inject(AuthenticationService);

  private appRoutes = AppRoutes;
  private ngOtpInput: NgOtpInputComponent;
  public errorMessage$: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public value = new FormControl("");
  public readonly isLoading = toSignal(this.authenticationService.isConfirmInProgress$);

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