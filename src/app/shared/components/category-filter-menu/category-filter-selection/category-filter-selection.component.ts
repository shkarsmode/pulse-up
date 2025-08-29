import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
    selector: "app-category-filter-selection",
    standalone: true,
    imports: [AngularSvgIconModule],
    templateUrl: "./category-filter-selection.component.html",
    styleUrl: "./category-filter-selection.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryFilterSelectionComponent {
    @Input() category: string;
    @Output() cancelSelection = new EventEmitter<void>();

    public onCancel() {
        this.cancelSelection.emit();
    }
}
