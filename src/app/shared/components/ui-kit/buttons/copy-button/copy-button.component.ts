import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
    selector: 'app-copy-button',
    standalone: true,
    template: `
        <button class="copy-button" (click)="copyLink($event)">
            <svg-icon
                src="assets/svg/{{ copied ? 'checked' : 'copy' }}.svg"
                class="copy-button__icon"
            />
        </button>
    `,
    styleUrl: './copy-button.component.scss',
    imports: [SvgIconComponent],
})
export class CopyButtonComponent {
    @Input() public link: string;

    @Output() public handleClick: EventEmitter<MouseEvent> =
        new EventEmitter<MouseEvent>();

    public copied = false;
    public copyLink(event: MouseEvent) {
        if (!this.link) return;
        this.handleClick.emit(event);
        navigator.clipboard.writeText(this.link).then(() => {
            this.copied = true;
            setTimeout(() => {
                this.copied = false;
            }, 1500);
        });
    }
}
