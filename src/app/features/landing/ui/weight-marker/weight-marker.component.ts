import { FormatNumberPipe } from '@/app/shared/pipes/format-number.pipe';
import { Component, Input } from '@angular/core';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';
import { PulseWeight } from '../../entities/PulseWeight.entity';

@Component({
  selector: 'app-weight-marker',
  standalone: true,
  imports: [NgxMapboxGLModule, FormatNumberPipe],
  templateUrl: './weight-marker.component.html',
  styleUrl: './weight-marker.component.scss'
})
export class WeightMarkerComponent {
  @Input() weight: PulseWeight
}
