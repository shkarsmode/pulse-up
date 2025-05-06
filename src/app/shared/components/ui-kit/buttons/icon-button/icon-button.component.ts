import { Component, Input } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";

@Component({
    selector: "app-icon-button",
    standalone: true,
    imports: [MatButtonModule],
    template: `
        <button
            mat-icon-button
            class="icon-button"
            [class.icon-button--outline]="variant === 'outline'"
            [style]="{ width: size + 'px', height: size + 'px' }">
            <span class="visually-hidden">{{ label }}</span>
            <ng-content></ng-content>
        </button>
    `,
    styles: `
      .icon-button {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
      }
      .icon-button--outline {
        border: 1px solid var(--light-grey-color);
      }
    `,
})
export class IconButtonComponent {
    @Input() label: string = "";
    @Input() size: number = 48;
    @Input() variant: "default" | "outline" = "default";
}
