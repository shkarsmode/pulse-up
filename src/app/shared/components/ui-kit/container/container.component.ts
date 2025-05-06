import { Component, Input } from "@angular/core";

@Component({
    selector: "app-container",
    standalone: true,
    imports: [],
    template: ` <div
        class="app-container"
        [style.max-width.px]="sizes[size] + 40">
        <ng-content></ng-content>
    </div>`,
    styles: [
        `
            .app-container {
                width: 100%;
                margin: 0 auto;
                padding: 0 20px;
            }
        `,
    ],
})
export class ContainerComponent {
    @Input() size: "md" | "lg" = "lg";

    public sizes = {
        md: 570,
        lg: 1030,
    };
}
