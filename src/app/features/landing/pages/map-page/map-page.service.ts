import { inject, Injectable } from "@angular/core";
import { IFilterCategory } from "@/app/shared/interfaces/category.interface";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { BehaviorSubject, combineLatest, map } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class MapPageService {
    private pulseService = inject(PulseService);
    private selectedCategory = new BehaviorSubject<IFilterCategory>("newest");

    public topicCategories$ = this.pulseService.categories$;
    public filterCategories$ = this.topicCategories$.pipe(
        map((categories) => categories.map(({ name }) => name)),
        map((categories) => ["newest", ...categories]),
    );
    public selectedCategory$ = this.selectedCategory.asObservable();
    public selectedTopicCategory$ = combineLatest([
        this.selectedCategory,
        this.topicCategories$,
    ]).pipe(
        map(([selected, categories]) => {
            if (selected === "newest") {
                return null;
            }
            return categories.find(({ name }) => name === selected) ?? null;
        }),
    );

    public setSelectedCategory(category: IFilterCategory) {
        this.selectedCategory.next(category);
    }
}
