// phone-form.service.ts
import { inject } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm } from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";
import { Router } from "@angular/router";
import intlTelInput, { Iti } from "intl-tel-input";
import { CountryCode, isValidPhoneNumber, validatePhoneNumberLength } from "libphonenumber-js";
import { delay, fromEvent, map, Observable, of, Subscription, take } from "rxjs";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";
import { NotificationService } from "./notification.service";

type ServiceWorkMode = "signIn" | "changePhoneNumber";

export class SignInFormService {
    private readonly router: Router = inject(Router);
    private readonly formBuilder: FormBuilder = inject(FormBuilder);
    private readonly notificationService: NotificationService = inject(NotificationService);
    private readonly authenticationService: AuthenticationService = inject(AuthenticationService);
    private iti: Iti;
    private mode: ServiceWorkMode = "signIn";
    private confirmPageUrls: Record<ServiceWorkMode, string> = {
        signIn: AppRoutes.Auth.CONFIRM_PHONE_NUMBER,
        changePhoneNumber: AppRoutes.Profile.CONFIRM_PHONE_NUMBER,
    };
    private confirmPageUrl: string = this.confirmPageUrls[this.mode];
    private subscriptions: Subscription[] = [];
    public isValid = true;
    public countryCodeChanged = false;
    public countryCode: string = "US";
    public form: FormGroup;
    public errorStateMatcher: ErrorStateMatcher;
    public AppRoutes = AppRoutes;
    public isSigninInProgress = this.authenticationService.isSigninInProgress$;
    public isChangingPhoneNumberInProgress =
        this.authenticationService.isChangePhoneNumberInProgress$;

    constructor() {
        this.errorStateMatcher = new CustomErrorStateMatcher(() => this.isValid);
    }

    public get control(): FormControl {
        return this.form.get("phone") as FormControl;
    }

    private createForm(initialValue: string = ""): FormGroup {
        return this.formBuilder.group({
            phone: initialValue,
        });
    }

    private resetInput() {
        const code = this.iti.getSelectedCountryData().dialCode;
        this.form.get("phone")?.reset("");
        this.validateNumber({ isEmptyValid: true });
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
        const allowedChars = /[0-9\+\-]/;
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

    public initialize({
        mode = "signIn",
        initialValue,
    }: { mode?: ServiceWorkMode; initialValue?: string } = {}) {
        this.form = this.createForm(initialValue);
        this.mode = mode;
        this.confirmPageUrl = this.confirmPageUrls[this.mode];
    }

    public onFocus = () => {
        const value = this.form.get("phone")?.value;
        if (!value) {
            this.resetInput();
        }
    };

    public onBlur = () => {
        this.validateNumber({ isEmptyValid: true });
    };

    public onInputKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Enter") {
            event.preventDefault();
            this.submit();
        } else if (!this.validateChar(event)) {
            event.preventDefault();
        } else if (!this.validateMaxValueLength(event)) {
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
            separateDialCode: true,
            dropdownContainer: document.body,
        });
        this.subscriptions.push(
            fromEvent(inputElement, "blur").pipe(delay(100), map(this.onBlur)).subscribe(),
            fromEvent(inputElement, "focus").pipe(map(this.onFocus)).subscribe(),
            fromEvent(inputElement, "countrychange")
                .pipe(map(this.onCountryCodeChange))
                .subscribe(),
            fromEvent(inputElement, "keydown")
                .pipe(map((event) => this.onInputKeyDown(event as KeyboardEvent)))
                .subscribe(),
        );
    };

    public onDestroy = () => {
        this.iti?.destroy();
        this.authenticationService.stopSignInProgress();
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
        this.subscriptions = [];
    };

    public validateNumber({ isEmptyValid = false }: { isEmptyValid?: boolean } = {}) {
        if (!this.iti) return;
        const value = this.form.get("phone")?.value;
        const dialCode = this.iti.getSelectedCountryData().dialCode;
        const iso2Code = this.iti.getSelectedCountryData().iso2?.toUpperCase();
        if (!iso2Code || !dialCode) return;

        const isEmpty = value === "";
        if (isEmpty && isEmptyValid) {
            this.isValid = true;
            return;
        }

        const valid = isValidPhoneNumber(dialCode + value, iso2Code as CountryCode);
        this.isValid = valid;
    }

    public submit = (): Observable<null | boolean> => {
        const dialCode = this.iti.getSelectedCountryData().dialCode;
        this.validateNumber();
        if (!this.isValid || !dialCode) return of(null);
        const phoneNumber = `+${dialCode}${this.form.value.phone}`;

        if (this.mode === "signIn") {
            return this.authenticationService.loginWithPhoneNumber(phoneNumber).pipe(
                take(1),
                map(() => true),
            );
        } else {
            return this.authenticationService.changePhoneNumber(phoneNumber).pipe(
                take(1),
                map(() => true),
            );
        }
    };

    private navigateToConfirmPage() {
        const redirectUrl = this.getRedirectUrl();
        const params = new URLSearchParams({
            ...(redirectUrl && { redirect: redirectUrl }),
            mode: this.mode,
        }).toString();
        this.router.navigateByUrl(`${this.confirmPageUrl}?${params}`);
    }

    private getRedirectUrl(): string | null {
        const tree = this.router.parseUrl(this.router.url);
        return tree.queryParams["redirect"] || null;
    }
}

class CustomErrorStateMatcher implements ErrorStateMatcher {
    constructor(private isValidRef: () => boolean) {}

    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return !this.isValidRef();
    }
}
