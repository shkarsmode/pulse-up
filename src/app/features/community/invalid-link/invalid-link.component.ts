import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppRoutes } from '../../../shared/enums/app-routes.enum';
import { AngularSvgIconModule } from "angular-svg-icon";
import { PrimaryButtonComponent } from '@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component';

@Component({
  selector: 'app-invalid-link',
  templateUrl: './invalid-link.component.html',
  styleUrl: './invalid-link.component.scss',
  standalone: true,
  imports: [AngularSvgIconModule, RouterModule, PrimaryButtonComponent],
})
export class InvalidLinkComponent {
  public routes = AppRoutes.Landing;
}

