import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
  selector: 'app-no-results',
  standalone: true,
  imports: [AngularSvgIconModule],
  templateUrl: './no-results.component.html',
  styleUrl: './no-results.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoResultsComponent {
  @Input() heading: string
  @Input() text: string[];
}
