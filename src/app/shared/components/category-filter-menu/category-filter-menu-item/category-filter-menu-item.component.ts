import { ICategory } from "@/app/shared/interfaces/category.interface";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MatMenuModule } from "@angular/material/menu";
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
    selector: "app-category-filter-menu-item",
    standalone: true,
    imports: [MatMenuModule, AngularSvgIconModule],
    templateUrl: "./category-filter-menu-item.component.html",
    styleUrl: "./category-filter-menu-item.component.scss",
})
export class CategoryFilterMenuItemComponent {
  @Input() category: ICategory | "all";
  @Input() isSelected = false;

  @Output() selectCategory = new EventEmitter<ICategory | "all">();

  public onSelect(): void {
      this.selectCategory.emit(this.category);
  }
}
