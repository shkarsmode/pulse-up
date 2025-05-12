import { Component } from '@angular/core';
import { AppRoutes } from '../../../shared/enums/app-routes.enum';

@Component({
  selector: 'app-invalid-link',
  templateUrl: './invalid-link.component.html',
  styleUrl: './invalid-link.component.scss',
})
export class InvalidLinkComponent {
  public routes = AppRoutes.Landing;
}

