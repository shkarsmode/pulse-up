import { Component } from '@angular/core';
import { TopicInfoComponent } from "../topic-info/topic-info.component";
import { tooltipText } from '../../../constants/tooltip-text';
import { RouterModule } from '@angular/router';
import { SvgIconComponent } from 'angular-svg-icon';
import { AppRoutes } from '@/app/shared/enums/app-routes.enum';

@Component({
  selector: 'app-location-picker',
  standalone: true,
  imports: [RouterModule, SvgIconComponent, TopicInfoComponent],
  templateUrl: './location-picker.component.html',
  styleUrl: './location-picker.component.scss'
})
export class LocationPickerComponent {
  public tooltipText = tooltipText.location
  public pickLicationAppRoute = `/${AppRoutes.User.Topic.PICK_LOCATION}`
}
