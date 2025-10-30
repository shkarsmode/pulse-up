import { Component, EventEmitter, Input, Output, OnChanges } from "@angular/core";
import { RippleEffectDirective } from "../../../../directives/ripple-effect";
import { CommonModule } from "@angular/common";
import { Colors } from "@/app/shared/enums/colors.enum";
import { MatProgressSpinner } from "@angular/material/progress-spinner";

@Component({
    selector: "app-secondary-button",
    standalone: true,
    imports: [CommonModule, RippleEffectDirective, MatProgressSpinner],
    templateUrl: "./secondary-button.component.html",
    styleUrl: "./secondary-button.component.scss",
})
export class SecondaryButtonComponent implements OnChanges {
    @Input() public type: "button" | "submit" | "reset" = "button";
    @Input() public disabled = false;
    @Input() public fullWidth = false;
    @Input() public fullHeight = false;
    @Input() public contrast = false;
    @Input() public size: "small" | "medium" | "large" = "medium";
    @Input() public color: Colors | null = null;
    @Input() public loading = false;

    @Output() public handleClick: EventEmitter<void> = new EventEmitter<void>();

    public classes = {};

    ngOnChanges(): void {
        this.classes = {
            "secondary-button": true,
            "secondary-button--small": this.size === "small",
            "secondary-button--medium": this.size === "medium",
            "secondary-button--large": this.size === "large",
            "secondary-button--full-width": this.fullWidth,
            "secondary-button--full-height": this.fullHeight,
            "secondary-button--contrast": this.contrast,
            "secondary-button--loading": this.loading,
        };
    }

    public onClick(): void {
        if (this.disabled) return;

        this.handleClick.emit();
    }
}
