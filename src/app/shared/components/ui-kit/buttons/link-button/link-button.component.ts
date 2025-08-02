import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@Component({
    selector: "app-link-button",
    standalone: true,
    imports: [MatButtonModule, MatProgressSpinnerModule],
    templateUrl: "./link-button.component.html",
    styleUrl: "./link-button.component.scss",
})
export class LinkButtonComponent {
    @Input() public disabled = false;
    @Input() public loading = false;
    @Input() public label = "";
    @Input() public type: HTMLButtonElement["type"] = "button";
    @Output() public handleClick: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
    public onClick(e: MouseEvent): void {
        this.handleClick.emit(e);
    }
}
