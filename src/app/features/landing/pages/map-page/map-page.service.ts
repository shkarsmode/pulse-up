import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ICategory } from "@/app/shared/interfaces/category.interface";

@Injectable({
    providedIn: "root",
})
export class MapPageService {
    private selectedCategorySubject = new BehaviorSubject<ICategory | null>(null);
    
    public selectedCategory$ = this.selectedCategorySubject.asObservable();

    public setSelectedCategory(category: ICategory | null) {
        this.selectedCategorySubject.next(category);
    } 
}
