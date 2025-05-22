import {
    AfterViewInit,
    Component,
    inject,
    OnDestroy,
    ViewChild,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { MatInputModule } from "@angular/material/input";
import { ErrorStateMatcher } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { SvgIconComponent } from "angular-svg-icon";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { PrimaryButtonComponent } from "../../../../shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { SignInFormService } from "../../services/sign-in-form.service";
import { AuthLayoutComponent } from "../../ui/auth-layout/auth-layout.component";

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
    ],
    providers: [SignInFormService],
    templateUrl: "./sign-in.component.html",
    styleUrl: "./sign-in.component.scss",
})
export class SignInComponent implements AfterViewInit, OnDestroy {
    private signInFormService: SignInFormService = inject(SignInFormService);
    private readonly appRotes = AppRoutes;

    @ViewChild("telInput") telInput: { nativeElement: HTMLInputElement };

    public get signInForm(): FormGroup {
        return this.signInFormService.form;
    }
    public get errorStateMatcher(): ErrorStateMatcher {
        return this.signInFormService.errorStateMatcher;
    }
    public get termsRoute(): string {
        return this.appRotes.Community.TERMS;
    }
    public get privacyRoute(): string {
        return this.appRotes.Community.PRIVACY;
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
}
