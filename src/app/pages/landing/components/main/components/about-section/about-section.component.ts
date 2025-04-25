import { Component } from '@angular/core';
import { AppRoutes } from '@/app/shared/enums/app-routes.enum';

@Component({
  selector: 'app-about-section',
  templateUrl: './about-section.component.html',
  styleUrl: './about-section.component.scss'
})
export class AboutSectionComponent {
  public isShowMore: boolean = false;
  public AppRoutes = AppRoutes
}
