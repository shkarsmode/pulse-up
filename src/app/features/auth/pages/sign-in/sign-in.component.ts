import { Component } from '@angular/core';
import { SvgIconComponent } from 'angular-svg-icon';
import { PrimaryButtonComponent } from "../../../../shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { RouterLink } from '@angular/router';
import { AppRoutes } from '@/app/shared/enums/app-routes.enum';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [RouterLink, SvgIconComponent, PrimaryButtonComponent],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent {
  private readonly appRotes = AppRoutes;

  public get termsRoute(): string {
    return this.appRotes.Community.TERMS;
  }

  public get privacyRoute(): string {
    return this.appRotes.Community.PRIVACY;
  }
}
