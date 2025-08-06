import {
    Component,
    EventEmitter,
    Output,
    ViewChild,
    ElementRef,
    inject,
    OnInit,
    DestroyRef,
    OnDestroy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatMenuModule, MatMenuTrigger } from "@angular/material/menu";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { map } from "rxjs/operators";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { ICategory } from "../../interfaces/category.interface";
import { FlatButtonDirective } from "../ui-kit/buttons/flat-button/flat-button.directive";
import { AngularSvgIconModule } from "angular-svg-icon";
import { CategoryFilterMenuItemComponent } from "./category-filter-menu-item/category-filter-menu-item.component";
import { CategoryFilterService } from "./category-filter.service";

@Component({
    selector: "app-category-filter-menu",
    standalone: true,
    imports: [
        CommonModule,
        MatMenuModule,
        MatButtonModule,
        MatIconModule,
        ReactiveFormsModule,
        FlatButtonDirective,
        AngularSvgIconModule,
        CategoryFilterMenuItemComponent,
    ],
    templateUrl: "./category-filter-menu.component.html",
    styleUrl: "./category-filter-menu.component.scss",
})
export class CategoryFilterMenuComponent implements OnInit, OnDestroy {
    private destroyRef = inject(DestroyRef);
    private categoryFilterService = inject(CategoryFilterService);

    @Output() selectedCategory = new EventEmitter<ICategory | null>();
    @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;
    @ViewChild("searchInput") searchInput: ElementRef<HTMLInputElement>;

    public filterControl = new FormControl<string>("");
    public clearButtonVisible$ = this.filterControl.valueChanges.pipe(map((value) => !!value));

    public get activeCategory(): ICategory | "all" {
        return this.categoryFilterService.activeCategory;
    }
    public get filteredCategories(): ICategory[] {
        return this.categoryFilterService.filteredCategories;
    }

    public ngOnInit(): void {
        this.filterControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.filterCategories();
        });
    }

    public ngOnDestroy(): void {
        this.categoryFilterService.reset();
    }

    public clearSearch(event: MouseEvent): void {
        event.stopPropagation();
        this.filterControl.setValue("");
        this.categoryFilterService.filteredCategories = [...this.categoryFilterService.categories];
        this.searchInput?.nativeElement.focus();
    }

    public onMenuOpened(): void {
        queueMicrotask(() => this.searchInput?.nativeElement.focus());
    }

    public onMenuClosed(): void {
        const timeout = setTimeout(() => {
            if (this.filterControl.value) {
                this.filterControl.setValue("");
                this.categoryFilterService.filteredCategories = [
                    ...this.categoryFilterService.categories,
                ];
                clearTimeout(timeout);
            }
        }, 100);
    }

    public onCategorySelect(category: ICategory | "all"): void {
        if (category === "all") {
            this.selectedCategory.emit(null);
        } else {
            this.selectedCategory.emit(category);
        }
        this.categoryFilterService.activeCategory = category;
        this.menuTrigger.closeMenu();
    }

    private filterCategories(): void {
        const search = (this.filterControl.value || "").toLowerCase();
        if (!search) {
            this.categoryFilterService.filteredCategories = [
                ...this.categoryFilterService.categories,
            ];
        } else {
            this.categoryFilterService.filteredCategories =
                this.categoryFilterService.categories.filter((cat) =>
                    cat.name.toLowerCase().includes(search),
                );
        }
    }
}
