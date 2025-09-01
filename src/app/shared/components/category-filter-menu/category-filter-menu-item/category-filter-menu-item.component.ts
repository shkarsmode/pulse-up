import { Component, EventEmitter, Input, Output, OnInit } from "@angular/core";
import { MatMenuModule } from "@angular/material/menu";
import { AngularSvgIconModule } from "angular-svg-icon";
import { IFilterCategory } from "@/app/shared/interfaces/category.interface";
import { StringUtils } from "@/app/shared/helpers/string-utils";


@Component({
    selector: "app-category-filter-menu-item",
    standalone: true,
    imports: [MatMenuModule, AngularSvgIconModule],
    templateUrl: "./category-filter-menu-item.component.html",
    styleUrl: "./category-filter-menu-item.component.scss",
})
export class CategoryFilterMenuItemComponent implements OnInit {
    @Input() category: IFilterCategory;
    @Input() isSelected = false;

    @Output() selectCategory = new EventEmitter<string>();

    public label: string;

    public ngOnInit() {
        this.label = StringUtils.capitalize(this.category);
    }

    public onSelect(): void {
        this.selectCategory.emit(this.category);
    }
}
