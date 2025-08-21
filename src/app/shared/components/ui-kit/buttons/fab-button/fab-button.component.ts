import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatRippleModule } from "@angular/material/core";
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
    selector: "app-fab-button",
    standalone: true,
    imports: [CommonModule, MatButtonModule, AngularSvgIconModule, MatRippleModule],
    templateUrl: "./fab-button.component.html",
    styleUrl: "./fab-button.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FabButtonComponent {
    @Input() color: "light" | "accent" = "light";
    @Input() icon: string | null = null;
    @Input() label: string | null = null;
    @Input() circle = false;

    @Output() handleClick = new EventEmitter<MouseEvent>();

    public onClick() {
        this.handleClick.emit();
    }
}
