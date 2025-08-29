// import { DestroyRef, inject, Injectable } from "@angular/core";
// import { PulseService } from "@/app/shared/services/api/pulse.service";
// import { tap } from "rxjs";
// import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
// import { ICategory, IFilterCategory } from "@/app/shared/interfaces/category.interface";

// @Injectable({
//     providedIn: "root",
// })
// export class CategoryFilterService {
//     // private readonly destroyRef = inject(DestroyRef);
//     // private readonly pulseService = inject(PulseService);

//     // private _categories: ICategory[] = [];
//     public activeCategory: IFilterCategory = "trending";
//     public filteredCategories: ICategory[] = [];

//     // public get categories(): ICategory[] {
//     //     return this._categories;
//     // }

//     // constructor() {
//     //     this.pulseService
//     //         .getCategories()
//     //         .pipe(
//     //             tap((categories) => {
//     //                 this._categories = categories;
//     //                 this.filteredCategories = [...categories];
//     //             }),
//     //             takeUntilDestroyed(this.destroyRef),
//     //         )
//     //         .subscribe();
//     // }

//     public reset() {
//         this.activeCategory = "all";
//         this.filteredCategories = [...this.categories];
//     }
// }
