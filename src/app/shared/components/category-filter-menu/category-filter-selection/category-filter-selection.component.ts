import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AngularSvgIconModule } from "angular-svg-icon";
import { ICategory } from '@/app/shared/interfaces/category.interface';

@Component({
  selector: 'app-category-filter-selection',
  standalone: true,
  imports: [AngularSvgIconModule],
  templateUrl: './category-filter-selection.component.html',
  styleUrl: './category-filter-selection.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryFilterSelectionComponent {
  @Input() category: ICategory;
  @Output() cancelSelection = new EventEmitter<void>();

  public onCancel() {
    this.cancelSelection.emit();
  }
}
