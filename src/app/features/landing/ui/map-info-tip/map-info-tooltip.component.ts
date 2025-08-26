import { ChangeDetectionStrategy, Component, Output, EventEmitter } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";
import { CloseButtonComponent } from "@/app/shared/components/ui-kit/buttons/close-button/close-button.component";

@Component({
    selector: "app-map-info-tooltip",
    standalone: true,
    imports: [AngularSvgIconModule, CloseButtonComponent],
    templateUrl: "./map-info-tooltip.component.html",
    styleUrl: "./map-info-tooltip.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapInfoTipComponent {
    @Output() closed = new EventEmitter<void>();

    public onClose() {
        this.closed.emit();
    }
}
