import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MatSlideToggleChange, MatSlideToggleModule } from "@angular/material/slide-toggle";

@Component({
    selector: "app-switch",
    standalone: true,
    imports: [MatSlideToggleModule],
    templateUrl: "./switch.component.html",
    styleUrl: "./switch.component.scss",
})
export class SwitchComponent {
    @Input() color: string = "#000000";
    @Input() label: { left?: string; right?: string } = {
        left: "",
        right: "",
    };
    @Input() ariaLabel: string = "";
    @Output() change: EventEmitter<boolean> = new EventEmitter<boolean>();

    public onChange(event: MatSlideToggleChange): void {
        this.change.emit(event.checked);
    }
}
