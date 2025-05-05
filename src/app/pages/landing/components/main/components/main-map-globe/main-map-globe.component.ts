import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MediaQueryService } from '@/app/shared/services/core/media-query.service';
import { AppRoutes } from '@/app/shared/enums/app-routes.enum';
import { IMapMarker } from '@/app/shared/interfaces/map-marker.interface';

@Component({
  selector: 'app-main-map-globe',
  templateUrl: './main-map-globe.component.html',
  styleUrl: './main-map-globe.component.scss'
})
export class MainMapGlobeComponent {
  private map: mapboxgl.Map | null = null;
  private router: Router = inject(Router);
  private mediaService = inject(MediaQueryService);
  private isMobile = toSignal(this.mediaService.mediaQuery('max', 'SM'));
  // At low zooms, complete a revolution every two minutes.
  private secondsPerRevolution = 120;
  // Above zoom level 5, do not rotate.
  private maxSpinZoom = 5;
  // Rotate at intermediate speeds between zoom levels 3 and 5.
  private slowSpinZoom = 3;
  private userInteracting = false;
  private spinEnabled = true;

  public AppRoutes = AppRoutes
  public zoom = 1.5;

  constructor() {
    effect(() => {
      this.zoom = this.isMobile() ? 1 : 1.5;
    })
  }

  public onMapLoaded(map: mapboxgl.Map) {
    this.map = map;
    this.removeLabelsFromMap();
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

    this.map.on('click', () => {
      this.navigateToMapPage();
    });
  }

  public onMarkerClick() {
    this.navigateToMapPage();
  }

  private navigateToMapPage() {
    this.router.navigateByUrl(`/${this.AppRoutes.Landing.MAP}`);
  }

  private spinGlobe() {
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
      center.lng += distancePerSecond;
      // Smoothly animate the map over one second.
      // When this animation is complete, it calls a 'moveend' event.
      this.map.easeTo({ center, duration: 500, easing: (n) => n });
    }

  }

  private removeLabelsFromMap() {
    if (!this.map) return;
    const layers = this.map.getStyle().layers;
    if (!layers) return;
    for (const layer of layers) {
      if (layer.type === 'symbol') {
        this.map.removeLayer(layer.id);
      }
    }
  }
}
