import { Component, Input } from '@angular/core';
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
  selector: 'app-large-pulse-footer-row',
  standalone: true,
  imports: [AngularSvgIconModule],
  templateUrl: './large-pulse-footer-row.component.html',
  styleUrl: './large-pulse-footer-row.component.scss'
})
export class LargePulseFooterRowComponent {
  @Input() text: string;
  @Input() icon: string;
}
