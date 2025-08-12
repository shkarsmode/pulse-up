import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { PrimaryButtonComponent } from "../../ui-kit/buttons/primary-button/primary-button.component";

@Component({
    selector: "app-download-app-button",
    standalone: true,
    imports: [PrimaryButtonComponent],
    templateUrl: "./download-app-button.component.html",
    styleUrl: "./download-app-button.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadAppButtonComponent {
    @Input() link: string;

    @Output() handleClick = new EventEmitter<void>();

    public onClick(): void {
        window.open(this.link);
        this.handleClick.emit();
    }
}
