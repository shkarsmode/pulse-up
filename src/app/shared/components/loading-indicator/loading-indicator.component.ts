import { Component, Input } from "@angular/core";
import { SvgIconComponent } from "angular-svg-icon";

@Component({
    selector: "app-loading-indicator",
    standalone: true,
    imports: [SvgIconComponent],
    template: `
        <div
            class="loading-indicator"
            [style.width.px]="size"
            [style.height.px]="size">
            <svg-icon src="assets/svg/loading-indicator.svg" />
        </div>
    `,
    styles: `
    .loading-indicator {
      position: relative;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;

      svg-icon {
        position: absolute;
        top: 0%;
        left: 0%;
        width: 100%;
        height: 100%;
        animation: rotate 2s linear infinite;
        transform-origin: 50%;
      }
    }

    @keyframes rotate {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
  `,
})
export class LoadingIndicatorComponent {
    @Input() size = 40;
}
