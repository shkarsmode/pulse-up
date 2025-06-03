import { Component, EventEmitter, Output } from '@angular/core';
import mapboxgl from 'mapbox-gl';
import { TopicLocation } from '../../interfaces/topic-location.interface';

@Component({
  selector: 'app-pick-location',
  templateUrl: './pick-location.component.html',
  styleUrl: './pick-location.component.scss'
})
export class PickLocationComponent {
  @Output() locationChanged = new EventEmitter<string>()
  map: mapboxgl.Map | null = null;
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
  }

  private onFlyEnd = () => {
    if (this.map) {
      const center = this.map.getCenter();
      console.log('Map fly ended at:', center);
    }
  }
}
