import { Component, inject, ViewChild } from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
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
    SecondaryButtonComponent
],
    providers: [SignInFormService],
    templateUrl: "./change-phone-number.component.html",
    styleUrl: "./change-phone-number.component.scss",
})
export class ChangePhoneNumberComponent {
    private router: Router = inject(Router);
    private signInFormService: SignInFormService = inject(SignInFormService);
    private authenticationService: AuthenticationService = inject(AuthenticationService);
    private appRotes = AppRoutes;
    private initialValue = this.authenticationService.firebaseAuth.currentUser?.phoneNumber || "";

    public isLoading$ = this.signInFormService.isChangingPhoneNumberInProgress.asObservable();

    @ViewChild("telInput") telInput: { nativeElement: HTMLInputElement };

    constructor() {
        this.signInFormService.initialize({
            initialValue: this.initialValue,
            mode: "changePhoneNumber",
        });
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

    public onSubmit() {
        return this.signInFormService.submit();
    }

    public onCancel(): void {
        this.router.navigateByUrl(`/${AppRoutes.Profile.EDIT}`);
    }
}
