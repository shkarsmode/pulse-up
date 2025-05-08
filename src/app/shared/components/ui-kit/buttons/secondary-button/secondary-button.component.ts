import { Component, EventEmitter, Input, Output } from "@angular/core";
import { RippleEffectDirective } from "../../../../directives/ripple-effect";
import { CommonModule } from "@angular/common";

@Component({
    selector: "app-secondary-button",
    standalone: true,
    imports: [CommonModule, RippleEffectDirective],
    templateUrl: "./secondary-button.component.html",
    styleUrl: "./secondary-button.component.scss",
})
export class SecondaryButtonComponent {
    @Input() public type: string = "button";
    @Input() public disabled: boolean = false;
    @Input() public fullWidth: boolean = false;
    @Input() public contrast: boolean = false;

    @Output() public handleClick: EventEmitter<void> = new EventEmitter<void>();

    public classes = {};

    ngOnInit(): void {
        this.classes = {
            "secondary-button": true,
            "secondary-button--full-width": this.fullWidth,
            "secondary-button--contrast": this.contrast,
        };
    }

    public onClick(): void {
        if (this.disabled) return;

        this.handleClick.emit();
    }
}
