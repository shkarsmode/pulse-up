import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgxMapboxGLModule, MapService } from 'ngx-mapbox-gl';
import { PulseMarkerIconComponent } from "../pulse-marker-icon/pulse-marker-icon.component";
import { ITopicMarker } from '../../interfaces/pulse-marker.interface';

@Component({
  selector: 'app-pulse-marker',
  standalone: true,
  imports: [CommonModule, NgxMapboxGLModule,  PulseMarkerIconComponent],
  providers: [MapService],
  templateUrl: './pulse-marker.component.html',
  styleUrl: './pulse-marker.component.scss'
})
export class PulseMarkerComponent {
    @Input() public marker: ITopicMarker;
    @Input() public delay: number = 0;

    ngOnInit(): void {
      console.log("PulseMarkerComponent initialized with marker:", this.marker);
      
    }

    public opacity: number = 0;

    public onImageLoaded(): void {
        this.opacity = 1;
    }
}
