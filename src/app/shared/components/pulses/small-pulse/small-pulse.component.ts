import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-small-pulse',
  standalone: true,
  imports: [],
  templateUrl: './small-pulse.component.html',
  styleUrl: './small-pulse.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmallPulseComponent {

}
