import { Component, EventEmitter, Output } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";

@Component({
    selector: "app-link-button",
    standalone: true,
    imports: [MatButtonModule],
    templateUrl: "./link-button.component.html",
    styleUrl: "./link-button.component.scss",
})
export class LinkButtonComponent {
    @Output() public click: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
    public onClick(e: MouseEvent): void {
        this.click.emit(e);
    }
}
