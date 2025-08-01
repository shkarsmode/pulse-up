import {
    Component,
    EventEmitter,
    Output,
    ViewChild,
    ElementRef,
    inject,
    OnInit,
    DestroyRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatMenuModule, MatMenuTrigger } from "@angular/material/menu";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { map, tap } from "rxjs/operators";
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { PulseService } from "../../services/api/pulse.service";
import { ICategory } from "../../interfaces/category.interface";
import { FlatButtonDirective } from "../ui-kit/buttons/flat-button/flat-button.directive";
import { AngularSvgIconModule } from "angular-svg-icon";
import { CategoryFilterMenuItemComponent } from "./category-filter-menu-item/category-filter-menu-item.component";

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
export class CategoryFilterMenuComponent implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
    private readonly pulseService = inject(PulseService);

    @Output() selectedCategory = new EventEmitter<ICategory | null>();

    public categories: ICategory[] = [];
    public filteredCategories: ICategory[] = [];
    public activeCategory: ICategory | "all" = "all";
    public filterControl = new FormControl<string>("");
    public clearButtonVisible$ = this.filterControl.valueChanges.pipe(
      map(value => !!value),
    )

    @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;
    @ViewChild("searchInput") searchInput: ElementRef<HTMLInputElement>;

    ngOnInit(): void {
        this.pulseService
            .getCategories()
            .pipe(
                tap((categories) => {
                    this.categories = categories;
                    this.filteredCategories = [...categories];
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();

        this.filterControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.filterCategories();
        });
    }

    public clearSearch(event: MouseEvent): void {
        event.stopPropagation();
        this.filterControl.setValue("", { emitEvent: false });
        this.filteredCategories = [...this.categories];
        this.searchInput?.nativeElement.focus();
    }

    public onMenuOpened(): void {
        queueMicrotask(() => this.searchInput?.nativeElement.focus());
    }

    public onMenuClosed(): void {
        const timeout = setTimeout(() => {
            if (this.filterControl.value) {
                this.filterControl.setValue("", { emitEvent: false });
                this.filteredCategories = [...this.categories];
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
        this.activeCategory = category;
        this.menuTrigger.closeMenu();
    }

    private filterCategories(): void {
        const search = (this.filterControl.value || "").toLowerCase();
        if (!search) {
            this.filteredCategories = [...this.categories];
        } else {
            this.filteredCategories = this.categories.filter((cat) =>
                cat.name.toLowerCase().includes(search),
            );
        }
    }
}
