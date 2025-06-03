import { Component, inject } from '@angular/core';
import { TopicInfoComponent } from "../topic-info/topic-info.component";
import { tooltipText } from '../../../constants/tooltip-text';
import { RouterModule } from '@angular/router';
import { SvgIconComponent } from 'angular-svg-icon';
import { AppRoutes } from '@/app/shared/enums/app-routes.enum';
import { SendTopicService } from '@/app/shared/services/core/send-topic.service';
import { TopicLocation } from '../../../interfaces/topic-location.interface';

@Component({
  selector: 'app-location-picker',
  standalone: true,
  imports: [RouterModule, SvgIconComponent, TopicInfoComponent],
  templateUrl: './location-picker.component.html',
  styleUrl: './location-picker.component.scss'
})
export class LocationPickerComponent {
  private readonly createTopicService = inject(SendTopicService);
  public tooltipText = tooltipText.location
  public pickLicationAppRoute = `/${AppRoutes.User.Topic.PICK_LOCATION}`;

  public get topicLocation() {
    const location = this.createTopicService.currentTopic.get("location")?.value as TopicLocation;
    return [location.country, location.state, location.city]
      .filter(Boolean)
      .join(", ");
  }
}
