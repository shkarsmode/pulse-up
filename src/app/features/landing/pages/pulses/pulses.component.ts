import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { combineLatest, distinctUntilChanged, map } from "rxjs";
import { InfiniteScrollDirective } from "ngx-infinite-scroll";
import { ITopic } from "@/app/shared/interfaces";
import { InputSearchComponent } from "../../ui/input-search/input-search.component";
import { InfiniteLoaderService } from "../../services/infinite-loader.service";
import { LoadingIndicatorComponent } from "@/app/shared/components/loading-indicator/loading-indicator.component";
import { ICategory } from "@/app/shared/interfaces/category.interface";
import { TrendingTopicsListItemComponent } from "../../ui/trending-topics-list-item/trending-topics-list-item.component";
import { VotesService } from "@/app/shared/services/votes/votes.service";
import { ContainerComponent } from "@/app/shared/components/ui-kit/container/container.component";
import { CategoryFilterMenuComponent } from "@/app/shared/components/category-filter-menu/category-filter-menu.component";
import { CategoryFilterSelectionComponent } from "@/app/shared/components/category-filter-menu/category-filter-selection/category-filter-selection.component";
import { CategoryFilterService } from "@/app/shared/components/category-filter-menu/category-filter.service";
import { PulsesPaginationService } from "../../services/pulses-pagination.service";
import { TopicsEmptyListComponent } from "../../ui/topics-empty-list/topics-empty-list.component";

@Component({
    selector: "app-pulses",
    templateUrl: "./pulses.component.html",
    styleUrl: "./pulses.component.scss",
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        InfiniteScrollDirective,
        LoadingIndicatorComponent,
        InputSearchComponent,
        TrendingTopicsListItemComponent,
        ContainerComponent,
        CategoryFilterMenuComponent,
        CategoryFilterSelectionComponent,
        TopicsEmptyListComponent,
    ],
    providers: [InfiniteLoaderService, PulsesPaginationService],
})
export class PulsesComponent {
    private readonly votesService = inject(VotesService);
    private readonly categoryFilterService = inject(CategoryFilterService);
    private readonly pulsesPaginationService = inject(PulsesPaginationService);

    public pulses: ITopic[] = [];
    public searchInFocus = false;
    public votes$ = this.votesService.votesByTopicId$;
    public topics$ = this.pulsesPaginationService.topics$;
    public isInitialLoading$ = this.pulsesPaginationService.initialLoading$;
    public isLoadingMore$ = this.pulsesPaginationService.paginationLoading$;
    public isEmpty$ = combineLatest([this.isInitialLoading$, this.topics$]).pipe(
        map(([isLoading, topics]) => !isLoading && topics.length === 0),
        distinctUntilChanged(),
    );
    public searchText = "";

    public get selectedCategory(): ICategory | null {
        return this.categoryFilterService.activeCategory === "all"
            ? null
            : this.categoryFilterService.activeCategory;
    }

    public loadMore() {
        this.pulsesPaginationService.loadMore();
    }

    public onSearchValueChange(searchValue: string): void {
        this.pulsesPaginationService.setSearchText(searchValue);
        this.searchText = searchValue;
    }

    public onCategorySelected(category: ICategory | null): void {
        this.categoryFilterService.activeCategory = category || "all";
        this.pulsesPaginationService.setCategoryFilter(category);
    }

    public onSearchFocus(): void {
        this.searchInFocus = true;
    }

    public onSearchBlur(): void {
        this.searchInFocus = false;
    }
}
