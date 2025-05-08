import { Component, input, Input } from "@angular/core";

@Component({
    selector: "app-container",
    standalone: true,
    imports: [],
    templateUrl: "./container.component.html",
    styleUrl: "./container.component.scss",
})
export class ContainerComponent {
    @Input() size: "lg" | "md" = "lg";
}
