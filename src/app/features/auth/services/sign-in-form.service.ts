// phone-form.service.ts
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";
import { inject } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm } from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";
import { Router } from "@angular/router";
import intlTelInput, { Iti } from "intl-tel-input";
import { CountryCode, isValidPhoneNumber, validatePhoneNumberLength } from "libphonenumber-js";
import { delay, fromEvent, map } from "rxjs";

export class SignInFormService {
    private router: Router = inject(Router);
    private readonly formBuilder: FormBuilder = inject(FormBuilder);
    private readonly authenticationService: AuthenticationService = inject(AuthenticationService);
    private iti: Iti;
    public isValid = true;
    public countryCodeChanged = false;
    public countryCode: string = "US";
    public form: FormGroup;
    public errorStateMatcher: ErrorStateMatcher;
    public AppRoutes: typeof AppRoutes;

    constructor() {
        this.form = this.createForm();
        this.errorStateMatcher = new CustomErrorStateMatcher(() => this.isValid);
        this.AppRoutes = AppRoutes;
    }

    private createForm(): FormGroup {
        return this.formBuilder.group({
            phone: "",
        });
    }

    private resetInput() {
        const code = this.iti.getSelectedCountryData().dialCode;
        this.form.get("phone")?.setValue("+" + code);
        this.validateNumber();
    }

    private validateMaxValueLength(event: KeyboardEvent) {
        let isValid = false;
        const numberChars = /[0-9\+\-\ ]/;
        if (!numberChars.test(event.key)) {
            isValid = true;
            return isValid;
        }
        const value = this.form.get("phone")?.value;
        const countryCode = this.iti.getSelectedCountryData().iso2?.toUpperCase();
        if (!countryCode) return;
        const validationResult = validatePhoneNumberLength(
            value + event.key,
            countryCode as CountryCode,
        );
        if (validationResult === "TOO_SHORT" || validationResult === undefined) {
            isValid = true;
        }
        return isValid;
    }

    private validateMinValueLength(event: KeyboardEvent) {
        if (event.key !== "Backspace") return true;
        let isValid = false;
        const value = this.form.get("phone")?.value;
        const countryCode = this.iti.getSelectedCountryData().dialCode;
        if (!countryCode) return;
        const minValueLength = `+${countryCode}`.length;
        if (value.length > minValueLength) {
            isValid = true;
        }
        return isValid;
    }

    private validateChar(event: KeyboardEvent) {
        let isValid = true;
        const allowedChars = /[0-9\+\-\ ]/;
        const allowedCtrlChars = /[axcv]/;
        const allowedOtherKeys = [
            "ArrowLeft",
            "ArrowUp",
            "ArrowRight",
            "ArrowDown",
            "Home",
            "End",
            "Insert",
            "Delete",
            "Backspace",
        ];

        if (
            !allowedChars.test(event.key) &&
            !(event.ctrlKey && allowedCtrlChars.test(event.key)) &&
            !allowedOtherKeys.includes(event.key)
        ) {
            isValid = false;
        }
        return isValid;
    }

    public onFocus = () => {
        const value = this.form.get("phone")?.value;
        if (!value) {
            this.resetInput();
        }
    };

    public onBlur = () => {
        this.validateNumber();
    };

    public onInputKeyDown = (event: KeyboardEvent) => {
        if (!this.validateChar(event)) {
            event.preventDefault();
        } else if (!this.validateMinValueLength(event) || !this.validateMaxValueLength(event)) {
            event.preventDefault();
        }
    };

    public onCountryCodeChange = () => {
        this.resetInput();
    };

    public onViewInit = (inputElement: HTMLInputElement) => {
        this.iti = intlTelInput(inputElement, {
            nationalMode: false,
            formatOnDisplay: true,
            initialCountry: "US",
            showFlags: true,
        });
        fromEvent(inputElement, "blur").pipe(delay(100), map(this.onBlur)).subscribe();
        fromEvent(inputElement, "focus").pipe(map(this.onFocus)).subscribe();
        fromEvent(inputElement, "countrychange").pipe(map(this.onCountryCodeChange)).subscribe();
        fromEvent(inputElement, "keydown")
            .pipe(map((event) => this.onInputKeyDown(event as KeyboardEvent)))
            .subscribe();
    };

    public onDestroy = () => {
        this.iti?.destroy();
    };

    public validateNumber() {
        if (!this.iti) return;
        const value = this.form.get("phone")?.value;
        const iso2Code = this.iti.getSelectedCountryData().iso2?.toUpperCase();
        const dialCode = this.iti.getSelectedCountryData().dialCode;
        if (!iso2Code) return;
        
        const isEmpty = value === "+" + dialCode;
        if (isEmpty) {
            this.isValid = true;
            return;
        }
        
        const valid = isValidPhoneNumber(value, iso2Code as CountryCode);
        this.isValid = valid;
    }

    public submit = () => {
        this.validateNumber();
        if (!this.isValid) return;
        const phone = this.form.value.phone;
        this.authenticationService.loginWithPhoneNumber(phone).subscribe({
            next: () => {
                console.log("Verification code sent successfully");
                this.navigateToConfirmPage();
            },
            error: (err) => {
                console.log("Error sending verification code:", err);
            },
        });
    };

    private navigateToConfirmPage() {
        this.router.navigateByUrl(`/${this.AppRoutes.Auth.CONFIRM}`);
    }
}

class CustomErrorStateMatcher implements ErrorStateMatcher {
    constructor(private isValidRef: () => boolean) {}

    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return !this.isValidRef();
    }
}
