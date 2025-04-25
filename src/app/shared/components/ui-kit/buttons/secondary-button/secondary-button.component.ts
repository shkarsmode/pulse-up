import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RippleEffectDirective } from '../../../../directives/ripple-effect';

@Component({
    selector: 'app-secondary-button',
    standalone: true,
    imports: [RippleEffectDirective],
    templateUrl: './secondary-button.component.html',
    styleUrl: './secondary-button.component.scss',
})
export class SecondaryButtonComponent {
    @Input() public type: string = 'button';
    @Input() public disabled: boolean = false;
    @Input() public fullWidth: boolean = false;

    @Output() public handleClick: EventEmitter<void> = new EventEmitter<void>();

    public onClick(): void {
        if (this.disabled) return;

        this.handleClick.emit();
    }
}
