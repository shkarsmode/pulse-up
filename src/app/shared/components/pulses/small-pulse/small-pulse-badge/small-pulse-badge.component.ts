import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
  selector: 'app-small-pulse-badge',
  standalone: true,
  imports: [CommonModule, AngularSvgIconModule],
  templateUrl: './small-pulse-badge.component.html',
  styleUrl: './small-pulse-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmallPulseBadgeComponent {
  @Input() text: string;
  @Input() leftIcon?: string;
}
