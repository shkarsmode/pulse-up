import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AngularSvgIconModule } from "angular-svg-icon";
import { AppRoutes } from '../../../shared/enums/app-routes.enum';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
  standalone: true,
  imports: [AngularSvgIconModule, RouterModule],
})
export class NotFoundComponent {
  public routes = AppRoutes.Landing;
}
