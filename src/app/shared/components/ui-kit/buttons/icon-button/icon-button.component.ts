import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";

@Component({
    selector: "app-icon-button",
    standalone: true,
    styleUrl: "./icon-button.component.scss",
    templateUrl: "./icon-button.component.html",
    imports: [MatButtonModule],
})
export class IconButtonComponent {
    @Input() label = "";
    @Input() size = 48;
    @Input() variant: "default" | "outline" = "default";
    @Input() type : "button" | "submit" = "button";
    @Input() disabled = false;

    @Output() handleClick: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

    public onClick(event: MouseEvent): void {
        this.handleClick.emit(event);
    }
}
