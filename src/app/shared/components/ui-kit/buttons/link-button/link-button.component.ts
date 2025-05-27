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
    @Input() public disabled: boolean = false;
    @Input() public loading: boolean = false;
    @Input() public label: string = "";
    @Output() public click: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
    public onClick(e: MouseEvent): void {
        this.click.emit(e);
    }
}
