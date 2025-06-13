import { Component } from '@angular/core';
import { TippyDirective } from '@ngneat/helipopper';

@Component({
  selector: 'app-map-popover',
  standalone: true,
  imports: [TippyDirective],
  templateUrl: './map-popover.component.html',
  styleUrl: './map-popover.component.scss'
})
export class MapPopoverComponent {

}
