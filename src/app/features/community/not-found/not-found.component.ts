import { Component } from '@angular/core';
import { AppRoutes } from '../../../shared/enums/app-routes.enum';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent {
  public routes = AppRoutes.Landing;
}
