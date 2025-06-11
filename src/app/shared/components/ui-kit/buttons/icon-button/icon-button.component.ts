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
    @Input() label: string = "";
    @Input() size: number = 48;
    @Input() variant: "default" | "outline" = "default";
    @Input() type : "button" | "submit" = "button";
    @Input() disabled: boolean = false;

    @Output() onClick: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

    public handleClick(event: MouseEvent): void {
        this.onClick.emit(event);
    }
}
