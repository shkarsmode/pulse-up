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
    Input,
    ChangeDetectionStrategy, OnChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatMenuModule, MatMenuTrigger } from "@angular/material/menu";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { map } from "rxjs/operators";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { FlatButtonDirective } from "../ui-kit/buttons/flat-button/flat-button.directive";
import { AngularSvgIconModule } from "angular-svg-icon";
import { CategoryFilterMenuItemComponent } from "./category-filter-menu-item/category-filter-menu-item.component";

const DEFAULT_CATEGORY = "trending";

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
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryFilterMenuComponent implements OnInit, OnDestroy, OnChanges {
    private destroyRef = inject(DestroyRef);

    @Input() options: string[] = [];
    @Output() selectedCategory = new EventEmitter<string>();
    @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;
    @ViewChild("searchInput") searchInput: ElementRef<HTMLInputElement>;

    public activeCategory = DEFAULT_CATEGORY;
    public filteredCategories: string[] = this.options;
    public filterControl = new FormControl<string>("");
    public clearButtonVisible$ = this.filterControl.valueChanges.pipe(map((value) => !!value));

    public ngOnInit(): void {
        this.filterControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.filterCategories();
        });
    }

    public ngOnChanges(): void {
        if (this.options.length && !this.filteredCategories.length) {
            this.filteredCategories = [...this.options];
        }
    }

    public ngOnDestroy(): void {
        this.activeCategory = DEFAULT_CATEGORY;
        this.filteredCategories = [...this.options];
    }

    public clearSearch(event: MouseEvent): void {
        event.stopPropagation();
        this.filterControl.setValue("");
        this.filteredCategories = [...this.options];
        this.searchInput?.nativeElement.focus();
    }

    public onMenuOpened(): void {
        queueMicrotask(() => this.searchInput?.nativeElement.focus());
    }

    public onMenuClosed(): void {
        const timeout = setTimeout(() => {
            if (this.filterControl.value) {
                this.filterControl.setValue("");
                this.filteredCategories = [...this.options];
                clearTimeout(timeout);
            }
        }, 100);
    }

    public onCategorySelect(category: string): void {
        this.selectedCategory.emit(category);
        this.activeCategory = category;
        this.menuTrigger.closeMenu();
    }

    private filterCategories(): void {
        const search = (this.filterControl.value || "").toLowerCase();
        if (!search) {
            this.filteredCategories = [...this.options];
        } else {
            this.filteredCategories = this.options.filter((option) =>
                option.toLowerCase().includes(search),
            );
        }
    }
}
