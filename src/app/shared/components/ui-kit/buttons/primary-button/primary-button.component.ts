import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RippleEffectDirective } from '../../../../directives/ripple-effect';

@Component({
    selector: 'app-primary-button',
    standalone: true,
    imports: [
        CommonModule,
        RippleEffectDirective,
        MatProgressSpinnerModule,
    ],
    templateUrl: './primary-button.component.html',
    styleUrl: './primary-button.component.scss',
})
export class PrimaryButtonComponent {
    @Input() public type: string = 'button';
    @Input() public disabled: boolean = false;
    @Input() public href: string = "";
    @Input() public target: "_blank" | "_self" | "_parent" | "_top" = '_self' as const;
    @Input() public color: string;
    @Input() public fullWidth: boolean = false;
    @Input() public contrast: boolean = false;
    @Input() public size: "small" | "medium" | "large" = "medium";
    @Input() public loading: boolean = false;

    @Output() public handleClick: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();


    public get classes(): Record<string, boolean> {
        return {
            'primary-button': true,
            'secondary-button--small': this.size === 'small',
            'secondary-button--medium': this.size === 'medium',
            'secondary-button--large': this.size === 'large',
            'primary-button--full-width': this.fullWidth,
            'primary-button--contrast': this.contrast,
            'primary-button--disabled': this.disabled,
        };
    }

    public onClick(event: MouseEvent): void {
        if (this.disabled) return;

        this.handleClick.emit(event);
    }
}
