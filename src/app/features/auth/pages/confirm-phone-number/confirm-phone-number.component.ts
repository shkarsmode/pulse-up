import { AfterViewInit, Component, inject, OnInit, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { BehaviorSubject } from "rxjs";
import { NgOtpInputComponent, NgOtpInputConfig, NgOtpInputModule } from "ng-otp-input";
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { AuthLayoutComponent } from "../../ui/auth-layout/auth-layout.component";
import { LinkButtonComponent } from "@/app/shared/components/ui-kit/buttons/link-button/link-button.component";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";
import { LocalStorageService } from "@/app/shared/services/core/local-storage.service";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { ConfirmPhoneNumberService } from "../../services/confirm-phone-number.service";

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
export class ConfirmPhoneNumberComponent implements OnInit, AfterViewInit {
    private readonly confirmPhoneNumberService: ConfirmPhoneNumberService = inject(ConfirmPhoneNumberService);

    @ViewChild(NgOtpInputComponent, { static: false }) ngOtpInput: NgOtpInputComponent;

    public code = this.confirmPhoneNumberService.value;
    public config: NgOtpInputConfig = {
        length: 6,
        allowNumbersOnly: true,
        inputClass: "otp-custom-input",
        containerClass: "otp-custom-container",
    };
    public isLoading = this.confirmPhoneNumberService.isLoading;
    public errorMessage$ = this.confirmPhoneNumberService.errorMessage$;
    private savedPhoneNumber: string = LocalStorageService.get("phoneNumberForSignin") || "";

    public get phoneNumber(): string {
        const value = this.savedPhoneNumber.toString();
        return value ? value.slice(0, -4).replace(/./g, "*") + value.slice(-4) : "";
    }

    ngOnInit() {
        this.code.valueChanges.subscribe((value) => {
            this.confirmPhoneNumberService.onConfirmationCodeChange(value || "");
        });
    }

    ngAfterViewInit(): void {
        this.confirmPhoneNumberService.onAfterViewInit(this.ngOtpInput);
    }
}
