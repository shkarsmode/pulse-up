import { Component, EventEmitter, Input, Output } from "@angular/core";
import { RippleEffectDirective } from "../../../../directives/ripple-effect";
import { CommonModule } from "@angular/common";
import { Colors } from "@/app/shared/enums/colors.enum";

@Component({
    selector: "app-secondary-button",
    standalone: true,
    imports: [CommonModule, RippleEffectDirective],
    templateUrl: "./secondary-button.component.html",
    styleUrl: "./secondary-button.component.scss",
})
export class SecondaryButtonComponent {
    @Input() public type: "button" | "submit" | "reset" = "button";
    @Input() public disabled: boolean = false;
    @Input() public fullWidth: boolean = false;
    @Input() public contrast: boolean = false;
    @Input() public size: "small" | "medium" | "large" = "medium";
    @Input() public color: Colors | null = null;

    @Output() public handleClick: EventEmitter<void> = new EventEmitter<void>();

    public classes = {};

    ngOnInit(): void {
        this.classes = {
            "secondary-button": true,
            "secondary-button--small": this.size === "small",
            "secondary-button--medium": this.size === "medium",
            "secondary-button--large": this.size === "large",
            "secondary-button--full-width": this.fullWidth,
            "secondary-button--contrast": this.contrast,
        };
    }

    public onClick(): void {
        if (this.disabled) return;

        this.handleClick.emit();
    }
}
