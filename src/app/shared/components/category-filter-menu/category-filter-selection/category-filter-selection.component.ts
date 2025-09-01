import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";
import { StringUtils } from "@/app/shared/helpers/string-utils";
import { IFilterCategory } from "@/app/shared/interfaces/category.interface";

@Component({
    selector: "app-category-filter-selection",
    standalone: true,
    imports: [AngularSvgIconModule],
    templateUrl: "./category-filter-selection.component.html",
    styleUrl: "./category-filter-selection.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryFilterSelectionComponent {
    @Input() category: IFilterCategory;
    @Output() cancelSelection = new EventEmitter<void>();

    public get label() {
        return StringUtils.capitalize(this.category);
    }

    public onCancel() {
        this.cancelSelection.emit();
    }
}
