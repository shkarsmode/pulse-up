import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
    signal,
} from "@angular/core";
import { SvgIconComponent } from "angular-svg-icon";

@Component({
    selector: "app-copy-button",
    standalone: true,
    template: `
        <button
            class="copy-button"
            (click)="copyLink($event)">
            <svg-icon
                src="assets/svg/{{ copied() ? 'checked' : 'copy' }}.svg"
                class="copy-button__icon" />
        </button>
    `,
    styleUrl: "./copy-button.component.scss",
    imports: [SvgIconComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CopyButtonComponent {
    @Input() public link: string;

    @Output() public handleClick: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

    public copied = signal(false);
    public copyLink(event: MouseEvent) {
        this.handleClick.emit(event);
        if (!this.link || this.copied()) return;
        navigator.clipboard.writeText(this.link).then(() => {
            this.copied.set(true);
            setTimeout(() => {
                this.copied.set(false);
            }, 1500);
        });
    }
}
