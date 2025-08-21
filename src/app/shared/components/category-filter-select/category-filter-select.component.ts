import { Component, DestroyRef, EventEmitter, inject, Output, ViewChild, OnInit } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatSelect } from "@angular/material/select";
import { CommonModule } from "@angular/common";
import { MatFormField } from "@angular/material/form-field";
import { MatOption } from "@angular/material/core";
import { ReplaySubject, take, tap } from "rxjs";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { ICategory } from "../../interfaces/category.interface";
import { PulseService } from "../../services/api/pulse.service";

@Component({
    selector: "app-category-filter-select",
    standalone: true,
    imports: [CommonModule, NgxMatSelectSearchModule, ReactiveFormsModule, MatFormField, MatOption, MatSelect],
    templateUrl: "./category-filter-select.component.html",
    styleUrl: "./category-filter-select.component.scss",
})
export class CategoryFilterSelectComponent implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
    private readonly pulseService = inject(PulseService);

    private categories: ICategory[] = [];
    public selectControl = new FormControl<ICategory | "all" | null>("all");
    public filterControl = new FormControl<string>("");
    public filteredCategories: ReplaySubject<ICategory[]> = new ReplaySubject<ICategory[]>();

    @Output() selectedCategory = new EventEmitter<ICategory | null>();
    @ViewChild("singleSelect", { static: true }) singleSelect: MatSelect;

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

        this.filterControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.filterCategories();
        });

        this.selectControl.valueChanges.subscribe((category: ICategory | "all" | null) => {
            if (category === "all") {
                this.selectedCategory.emit();
            } else if (category) {
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
