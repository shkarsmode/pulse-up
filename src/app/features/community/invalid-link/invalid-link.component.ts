import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppRoutes } from '../../../shared/enums/app-routes.enum';
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
  selector: 'app-invalid-link',
  templateUrl: './invalid-link.component.html',
  styleUrl: './invalid-link.component.scss',
  standalone: true,
  imports: [AngularSvgIconModule, RouterModule],
})
export class InvalidLinkComponent {
  public routes = AppRoutes.Landing;
}

