import { Component, Input, ViewEncapsulation } from '@angular/core';
import { SvgIconComponent } from 'angular-svg-icon';
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
  selector: 'app-topic-info',
  standalone: true,
  imports: [SvgIconComponent, MatTooltipModule],
  templateUrl: './topic-info.component.html',
  styleUrl: './topic-info.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class TopicInfoComponent {
  @Input() text = '';
}
