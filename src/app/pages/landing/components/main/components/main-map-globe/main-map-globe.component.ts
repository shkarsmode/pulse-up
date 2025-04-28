import { Component } from '@angular/core';
import throttle from 'lodash.throttle';
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
    // Pause spinning on interaction
    this.map.on('mousedown', () => {
      this.userInteracting = true;
    });

    // Restart spinning the globe when interaction is complete
    this.map.on('mouseup', () => {
      this.userInteracting = false;
      this.spinGlobe();
    });

    // These events account for cases where the mouse has moved
    // off the map, so 'mouseup' will not be fired.
    this.map.on('dragend', () => {
      this.userInteracting = false;
      this.spinGlobe();
    });
    this.map.on('pitchend', () => {
      this.userInteracting = false;
      this.spinGlobe();
    });
    this.map.on('rotateend', () => {
      this.userInteracting = false;
      this.spinGlobe();
    });

    // When animation is complete, start spinning if there is no ongoing interaction
    this.map.on('moveend', () => {
      this.spinGlobe();
    });

    this.map.on('zoomstart', () => {
      this.userInteracting = true;
    });

    this.map.on('zoomend', throttle(() => {
      this.userInteracting = false;
      this.spinGlobe();
    }, 300, { leading: true, trailing: false }));
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
