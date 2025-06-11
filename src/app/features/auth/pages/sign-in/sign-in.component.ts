import { AfterViewInit, Component, inject, OnDestroy, ViewChild } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { toSignal } from "@angular/core/rxjs-interop";
import { MatInputModule } from "@angular/material/input";
import { ErrorStateMatcher } from "@angular/material/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { SvgIconComponent } from "angular-svg-icon";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { PrimaryButtonComponent } from "../../../../shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { SignInFormService } from "../../../../shared/services/core/sign-in-form.service";
import { AuthLayoutComponent } from "../../ui/auth-layout/auth-layout.component";
import { LinkButtonComponent } from "@/app/shared/components/ui-kit/buttons/link-button/link-button.component";

@Component({
    selector: "app-sign-in",
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        MatInputModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        SvgIconComponent,
        PrimaryButtonComponent,
        AuthLayoutComponent,
        LinkButtonComponent,
    ],
    providers: [SignInFormService],
    templateUrl: "./sign-in.component.html",
    styleUrl: "./sign-in.component.scss",
})
export class SignInComponent implements AfterViewInit, OnDestroy {
    private router: Router = inject(Router);
    private signInFormService: SignInFormService = inject(SignInFormService);
    private readonly appRotes = AppRoutes;

    public readonly isLoading = toSignal(this.signInFormService.isSigninInProgress);

    @ViewChild("telInput") telInput: { nativeElement: HTMLInputElement };

    constructor() {
        this.signInFormService.initialize();
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

    ngAfterViewInit(): void {
        this.signInFormService.onViewInit(this.telInput.nativeElement);
    }

    ngOnDestroy(): void {
        this.signInFormService.onDestroy();
    }

    public onFocus() {
        this.telInput.nativeElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
        })
    }

    public onSubmit() {
        return this.signInFormService.submit();
    }

    public onClickGuest() {
        this.navigateToHomePage();
    }

    private navigateToHomePage(){
        this.router.navigate([this.appRotes.Landing.HOME]);
    }
}
