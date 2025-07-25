import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-large-pulse-label',
  standalone: true,
  imports: [],
  templateUrl: './large-pulse-label.component.html',
  styleUrl: './large-pulse-label.component.scss'
})
export class LargePulseLabelComponent {
  @Input({ required: true }) text: string = '';
}
