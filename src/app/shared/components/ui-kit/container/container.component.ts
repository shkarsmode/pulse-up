import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
    selector: "app-container",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./container.component.html",
    styleUrl: "./container.component.scss",
})
export class ContainerComponent {
    @Input() size: "lg" | "md" = "lg";
    @Input() maxWidth: number | null = null;
}
