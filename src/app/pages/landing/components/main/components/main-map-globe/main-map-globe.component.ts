import { Component } from '@angular/core';
import { AppRoutes } from '@/app/shared/enums/app-routes.enum';

@Component({
  selector: 'app-main-map-globe',
  templateUrl: './main-map-globe.component.html',
  styleUrl: './main-map-globe.component.scss'
})
export class MainMapGlobeComponent {
  private map: mapboxgl.Map | null = null;
  public AppRoutes = AppRoutes

  // At low zooms, complete a revolution every two minutes.
  private secondsPerRevolution = 120;
  // Above zoom level 5, do not rotate.
  private maxSpinZoom = 5;
  // Rotate at intermediate speeds between zoom levels 3 and 5.
  private slowSpinZoom = 3;

  private userInteracting = false;
  private spinEnabled = true;

  public onMapLoaded(map: mapboxgl.Map) {
    this.map = map;
    this.spinGlobe();

    // Pause spinning on user interaction (mouse or touch)
    const onUserInteractionStart = () => {
      this.userInteracting = true;
    };

    const onUserInteractionEnd = () => {
      this.userInteracting = false;
      this.spinGlobe();
    };

    this.map.on('mousedown', onUserInteractionStart);
    this.map.on('touchstart', onUserInteractionStart);

    this.map.on('mouseup', onUserInteractionEnd);
    this.map.on('touchend', onUserInteractionEnd);

    this.map.on('dragend', onUserInteractionEnd);
    this.map.on('pitchend', onUserInteractionEnd);
    this.map.on('rotateend', onUserInteractionEnd);

    this.map.on('moveend', () => {
      this.spinGlobe();
    });
  }

  spinGlobe() {
    if (!this.map) return;
    const zoom = this.map.getZoom();
    if (this.spinEnabled && !this.userInteracting && zoom < this.maxSpinZoom) {
      let distancePerSecond = 360 / this.secondsPerRevolution;
      if (zoom > this.slowSpinZoom) {
        // Slow spinning at higher zooms
        const zoomDif =
          (this.maxSpinZoom - zoom) / (this.maxSpinZoom - this.slowSpinZoom);
        distancePerSecond *= zoomDif;
      }
      const center = this.map.getCenter();
      center.lng -= distancePerSecond;
      // Smoothly animate the map over one second.
      // When this animation is complete, it calls a 'moveend' event.
      this.map.easeTo({ center, duration: 1000, easing: (n) => n });
    }

  }
}
