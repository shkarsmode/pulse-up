import { Component, inject, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutes } from '@/app/shared/enums/app-routes.enum';
import { SendTopicService } from '@/app/shared/services/core/send-topic.service';
import { TopicInfoComponent } from "../topic-info/topic-info.component";
import { tooltipText } from '../../../constants/tooltip-text';
import { TopicLocation } from '../../../interfaces/topic-location.interface';

@Component({
  selector: 'app-location-picker',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, TopicInfoComponent],
  templateUrl: './location-picker.component.html',
  styleUrl: './location-picker.component.scss'
})
export class LocationPickerComponent {
  private readonly createTopicService = inject(SendTopicService);
  public tooltipText = tooltipText.location
  public pickLicationAppRoute = `/${AppRoutes.User.Topic.PICK_LOCATION}`;

  public get topicLocation() {
    const location = this.createTopicService.currentTopic.get("location")?.value as TopicLocation;
    return [location.city, location.state, location.country]
      .filter(Boolean)
      .join(", ");
  }
}
