import { Component, inject, ViewChild, AfterViewInit, OnDestroy, OnInit } from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { map, take, tap } from "rxjs";
import { ErrorStateMatcher } from "@angular/material/core";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { CommonModule } from "@angular/common";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { SignInFormService } from "@/app/shared/services/core/sign-in-form.service";
import { ProfileLayoutComponent } from "../../ui/profile-layout/profile-layout.component";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";
import { SecondaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/secondary-button/secondary-button.component";
import { isErrorWithMessage } from "@/app/shared/helpers/errors/is-error-with-message";
import { NotificationService } from "@/app/shared/services/core/notification.service";

@Component({
    selector: "app-change-phone-number",
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatInputModule,
        MatFormFieldModule,
        ProfileLayoutComponent,
        PrimaryButtonComponent,
        SecondaryButtonComponent,
    ],
    providers: [SignInFormService],
    templateUrl: "./change-phone-number.component.html",
    styleUrl: "./change-phone-number.component.scss",
})
export class ChangePhoneNumberComponent implements AfterViewInit, OnDestroy, OnInit {
    private router: Router = inject(Router);
    private notificationService = inject(NotificationService);
    private signInFormService: SignInFormService = inject(SignInFormService);
    private authenticationService: AuthenticationService = inject(AuthenticationService);
    private appRotes = AppRoutes;

    public isLoading$ = this.signInFormService.isChangingPhoneNumberInProgress.asObservable();
    public initialValue = "";

    @ViewChild("telInput") telInput: { nativeElement: HTMLInputElement };

    ngOnInit() {
        this.signInFormService.initialize({
            initialValue: "",
            mode: "changePhoneNumber",
        });

        this.authenticationService.firebaseUser$
            .pipe(
                take(1),
                map((user) => user?.phoneNumber || ""),
                tap((value) => {
                    this.signInForm.setValue({ phone: value });
                    this.initialValue = value;
                }),
            )
            .subscribe();
    }

    public get signInForm(): FormGroup {
        return this.signInFormService.form;
    }
    public get errorStateMatcher(): ErrorStateMatcher {
        return this.signInFormService.errorStateMatcher;
    }
    public get termsRoute(): string {
        return `/${this.appRotes.Community.TERMS}`;
    }
    public get privacyRoute(): string {
        return `/${this.appRotes.Community.PRIVACY}`;
    }

    public get disabled(): boolean {
        return (
            this.signInFormService.control.value === this.initialValue ||
            !!this.signInFormService.isChangingPhoneNumberInProgress.value
        );
    }

    ngAfterViewInit(): void {
        this.signInFormService.onViewInit(this.telInput.nativeElement);
    }

    ngOnDestroy(): void {
        this.signInFormService.onDestroy();
    }

    public async onSubmit() {
        try {
            await this.signInFormService.submit();
            this.navigateToConfirmPage();
        } catch (error) {
            console.log("Error changing phone number:", error);
            if (isErrorWithMessage(error)) {
                this.notificationService.error(error.message);
            } else {
                this.notificationService.error("Failed to change phone number. Please try again.");
            }
        }
    }

    public onCancel(): void {
        this.router.navigateByUrl(`/${AppRoutes.Profile.EDIT}`);
    }

    private navigateToConfirmPage() {
        const redirectUrl = this.getRedirectUrl();
        const params = new URLSearchParams({
            ...(redirectUrl && { redirect: redirectUrl }),
            mode: "changePhoneNumber",
        }).toString();
        this.router.navigateByUrl(`${AppRoutes.Profile.CONFIRM_PHONE_NUMBER}?${params}`);
    }

    private getRedirectUrl(): string | null {
        const tree = this.router.parseUrl(this.router.url);
        return tree.queryParams["redirect"] || null;
    }
}
