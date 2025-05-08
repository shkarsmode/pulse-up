import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RippleEffectDirective } from '../../../../directives/ripple-effect';

@Component({
    selector: 'app-primary-button',
    standalone: true,
    imports: [
        CommonModule,
        RippleEffectDirective,
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

    @Output() public handleClick: EventEmitter<void> = new EventEmitter<void>();

    public classes = {}

    ngOnInit(): void {
        this.classes = {
            'primary-button': true,
            'primary-button--full-width': this.fullWidth,
            'primary-button--contrast': this.contrast,
            'primary-button--disabled': this.disabled,
        }
    }

    public onClick(): void {
        if (this.disabled) return;

        this.handleClick.emit();
    }
}
