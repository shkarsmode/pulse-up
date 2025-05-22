import { Component, inject, OnInit, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { BehaviorSubject } from "rxjs";
import { NgOtpInputComponent, NgOtpInputConfig, NgOtpInputModule } from "ng-otp-input";
import { AuthLayoutComponent } from "../../ui/auth-layout/auth-layout.component";
import { LinkButtonComponent } from "@/app/shared/components/ui-kit/buttons/link-button/link-button.component";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";
import { LocalStorageService } from "@/app/shared/services/core/local-storage.service";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";

@Component({
    selector: "app-confirm-phone-number",
    standalone: true,
    imports: [
        NgOtpInputModule,
        CommonModule,
        ReactiveFormsModule,
        AuthLayoutComponent,
        LinkButtonComponent,
    ],
    templateUrl: "./confirm-phone-number.component.html",
    styleUrl: "./confirm-phone-number.component.scss",
})
export class ConfirmPhoneNumberComponent implements OnInit {
    private readonly router: Router = inject(Router);
    private readonly authenticationService: AuthenticationService = inject(AuthenticationService);

    @ViewChild(NgOtpInputComponent, { static: false }) ngOtpInput: NgOtpInputComponent;

    public code = new FormControl("");
    public config: NgOtpInputConfig = {
        length: 6,
        allowNumbersOnly: true,
        inputClass: "otp-custom-input",
        containerClass: "otp-custom-container",
    };
    public errorMessage$: BehaviorSubject<string> = new BehaviorSubject<string>("");
    private savedPhoneNumber: string = LocalStorageService.get("phoneNumber") || "";
    private appRoutes = AppRoutes;

    public get phoneNumber(): string {
        const value = this.savedPhoneNumber.toString();
        return value ? value.slice(0, -4).replace(/./g, "*") + value.slice(-4) : "";
    }

    ngOnInit() {
        this.code.valueChanges.subscribe((value) => {
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
                        this.setErrorMessage("Invalid verification code. Please try again.");
                        this.resetInput();
                    },
                });
            }
        });
    }

    private setErrorMessage(message: string) {
        this.errorMessage$.next(message);
    }

    private resetInput() {
        this.code.setValue("");
        const eleId = this.ngOtpInput.getBoxId(0);
        this.ngOtpInput.focusTo(eleId);
    }

    private navigateToHomePage() {
        this.router.navigateByUrl(this.appRoutes.Landing.HOME);
    }
}
