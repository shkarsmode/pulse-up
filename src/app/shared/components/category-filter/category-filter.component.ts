import { Component, DestroyRef, EventEmitter, inject, Output, ViewChild } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatSelect } from "@angular/material/select";
import { ReplaySubject, take, tap } from "rxjs";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { MaterialModule } from "../../modules/material.module";
import { ICategory } from "../../interfaces/category.interface";
import { PulseService } from "../../services/api/pulse.service";
import { CommonModule } from "@angular/common";

@Component({
    selector: "app-category-filter",
    standalone: true,
    imports: [CommonModule, NgxMatSelectSearchModule, MaterialModule, ReactiveFormsModule],
    templateUrl: "./category-filter.component.html",
    styleUrl: "./category-filter.component.scss",
})
export class CategoryFilterComponent {
    private readonly destroyRef = inject(DestroyRef);
    private readonly pulseService = inject(PulseService);

    private categories: ICategory[] = [];
    public selectControl = new FormControl<ICategory | null>(null);
    public filterControl = new FormControl<string>("");
    public filteredCategories: ReplaySubject<ICategory[]> = new ReplaySubject<ICategory[]>();

    @Output() selectedCategory = new EventEmitter<ICategory>();
    @ViewChild("singleSelect", { static: true }) singleSelect: MatSelect;

    constructor() {}

    ngOnInit() {
        this.pulseService
            .getCategories()
            .pipe(
                take(1),
                tap((categories) => {
                    this.categories = categories;
                    this.filteredCategories.next(categories);
                }),
            )
            .subscribe();

        this.filterControl.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.filterCategories();
            });

        this.selectControl.valueChanges.subscribe((category: ICategory | null) => {
            if (category) {
                this.selectedCategory.emit(category);
            }
        });
    }

    protected filterCategories() {
        if (!this.categories.length) {
            return;
        }

        let search = this.filterControl.value;
        if (!search) {
            this.filteredCategories.next(this.categories.slice());
            return;
        } else {
            search = search.toLowerCase();
        }
        
        this.filteredCategories.next(
            this.categories.filter((category) => category.name.toLowerCase().indexOf(search) > -1),
        );
    }
}
