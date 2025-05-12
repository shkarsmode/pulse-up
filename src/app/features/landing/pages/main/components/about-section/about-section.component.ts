import { Component } from '@angular/core';
import { AppRoutes } from '@/app/shared/enums/app-routes.enum';
import { Colors } from '@/app/shared/enums/colors.enum';

@Component({
  selector: 'app-about-section',
  templateUrl: './about-section.component.html',
  styleUrl: './about-section.component.scss'
})
export class AboutSectionComponent {
  public isShowMore: boolean = false;
  public AppRoutes = AppRoutes
  public buttonColor = Colors.BLACK;
}
