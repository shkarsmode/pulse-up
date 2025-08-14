import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
  selector: 'app-small-pulse-stats-item',
  standalone: true,
  imports: [CommonModule, AngularSvgIconModule],
  templateUrl: './small-pulse-stats-item.component.html',
  styleUrl: './small-pulse-stats-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmallPulseStatsItemComponent {
  @Input() title: string;
  @Input() value: string;
  @Input() icon?: string;
}
