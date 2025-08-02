import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { NgxMapboxGLModule, MapService } from 'ngx-mapbox-gl';
import { ITopicMarker } from '../../helpers/interfaces/pulse-marker.interface';
import { PulseMarkerIconComponent } from "../pulse-marker-icon/pulse-marker-icon.component";

@Component({
  selector: 'app-pulse-marker',
  standalone: true,
  imports: [CommonModule, NgxMapboxGLModule,  PulseMarkerIconComponent],
  providers: [MapService],
  templateUrl: './pulse-marker.component.html',
  styleUrl: './pulse-marker.component.scss'
})
export class PulseMarkerComponent implements OnInit {
    @Input() public marker: ITopicMarker;
    @Input() public delay = 0;

    ngOnInit(): void {
      console.log("PulseMarkerComponent initialized with marker:", this.marker);
      
    }

    public opacity = 0;

    public onImageLoaded(): void {
        this.opacity = 1;
    }
}
