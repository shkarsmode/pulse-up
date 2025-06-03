import { Component, inject } from '@angular/core';
import mapboxgl from 'mapbox-gl';
import { Router } from '@angular/router';
import { SendTopicService } from '@/app/shared/services/core/send-topic.service';
import { TopicLocation } from '../../interfaces/topic-location.interface';
import { AppRoutes } from '@/app/shared/enums/app-routes.enum';

@Component({
  selector: 'app-pick-location',
  templateUrl: './pick-location.component.html',
  styleUrl: './pick-location.component.scss'
})
export class PickLocationComponent {
  private readonly router = inject(Router);
  private readonly createTopicService = inject(SendTopicService);

  map: mapboxgl.Map | null = null;
  selectedLocation: TopicLocation | null = null;
  
  onMapLoaded(map: mapboxgl.Map) {
    this.map = map;
    this.map.on('moveend', this.onFlyEnd);
  }

  onLocationSelected(location: TopicLocation) {
    console.log('Location selected:', location);
    this.map?.flyTo({
      center: [location.lng, location.lat],
      zoom: 10,
    })
    this.selectedLocation = location;
  }

  onConfirmLocation() {
    if (this.selectedLocation) {
      this.createTopicService.setTopicLocation(this.selectedLocation);
      this.router.navigateByUrl('/' + AppRoutes.User.Topic.SUGGEST);
    }
  }

  private onFlyEnd = () => {
    if (this.map) {
      const center = this.map.getCenter();
      console.log('Map fly ended at:', center);
    }
  }
}
