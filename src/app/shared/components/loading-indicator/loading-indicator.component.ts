import { Component } from '@angular/core';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
  selector: 'app-loading-indicator',
  standalone: true,
  imports: [SvgIconComponent],
  template: `
    <div class="loading-indicator">
      <svg-icon src="assets/svg/loading-indicator.svg" />
    </div>
  `,
  styles: `
    .loading-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        animation: rotate 2s linear infinite;
        transform-origin: 50%;
    }

    @keyframes rotate {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
  `
})
export class LoadingIndicatorComponent {

}
