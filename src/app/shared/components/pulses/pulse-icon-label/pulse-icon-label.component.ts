import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pulse-icon-label',
  standalone: true,
  imports: [],
  templateUrl: './pulse-icon-label.component.html',
  styleUrl: './pulse-icon-label.component.scss'
})
export class PulseIconLabelComponent {
  @Input({ required: true }) text = '';
}
