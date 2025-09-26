import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AngularSvgIconModule } from "angular-svg-icon";
import { takeUntilDestroyed, toObservable, toSignal } from "@angular/core/rxjs-interop";
import { InfiniteScrollDirective } from "ngx-infinite-scroll";
import { BehaviorSubject, combineLatest, tap } from "rxjs";
import { InputSearchComponent } from "../../ui/input-search/input-search.component";
import { InfiniteLoaderService } from "../../services/infinite-loader.service";
import { LoadingIndicatorComponent } from "@/app/shared/components/loading-indicator/loading-indicator.component";
import { TrendingTopicsListItemComponent } from "../../ui/trending-topics-list-item/trending-topics-list-item.component";
import { VotesService } from "@/app/shared/services/votes/votes.service";
import { ContainerComponent } from "@/app/shared/components/ui-kit/container/container.component";
import { CategoryFilterMenuComponent } from "@/app/shared/components/category-filter-menu/category-filter-menu.component";
import { CategoryFilterSelectionComponent } from "@/app/shared/components/category-filter-menu/category-filter-selection/category-filter-selection.component";
import { PulsesPaginationService } from "../../services/pulses-pagination.service";
import { TopicsEmptyListComponent } from "../../ui/topics-empty-list/topics-empty-list.component";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { TopicsService } from "./topics.service";

@Component({
    selector: "app-topics",
    templateUrl: "./topics.component.html",
    styleUrl: "./topics.component.scss",
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
        PrimaryButtonComponent,
        AngularSvgIconModule,
    ],
    providers: [InfiniteLoaderService, PulsesPaginationService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicsComponent implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
    private readonly votesService = inject(VotesService);
    public readonly topicsService = inject(TopicsService);

    public userVotesMap = toSignal(this.votesService.votesByTopicId$);
    public suggestTopicRoute = "/" + AppRoutes.User.Topic.SUGGEST;
    public globalTopicsQuery = this.topicsService.globalTopicsQuery;
    public isTrendingTopicsLoading = this.topicsService.isTrendingTopicsLoading;
    private isEmptyTrendingTopics$ = toObservable(this.topicsService.isEmptyTrendingTopics);
    private selectedCategory$ = toObservable(this.topicsService.category);
    private isSwitchedCategory = new BehaviorSubject(false);

    public categories = this.topicsService.categories;
    public trendingTopics = this.topicsService.trendingTopics;
    public isEmptyGlobalTopics = this.topicsService.isEmptyGlobalTopics;
    public isEmptyTrendingTopics = this.topicsService.isEmptyTrendingTopics;

    public get searchText() {
        return this.topicsService.searchText();
    }
    public get selectedCategory() {
        return this.topicsService.category();
    }
    public get isTrendingCategorySelected() {
        return this.selectedCategory === "trending";
    }
    public get isLoadingMore() {
        return this.globalTopicsQuery.isFetchingNextPage();
    }

    public ngOnInit() {
        this.topicsService.refetchTopics();
        this.topicsService.syncFiltersWithQueryParams();


        combineLatest([this.isEmptyTrendingTopics$, this.selectedCategory$, this.isSwitchedCategory]).pipe(
            tap(([isEmpty, selectedCategory, isSwitched]) => {
                if (isEmpty && selectedCategory === "trending" && !isSwitched) {
                    this.topicsService.setCategory("newest");
                    this.isSwitchedCategory.next(true);
                }
            }),
            takeUntilDestroyed(this.destroyRef),
        ).subscribe();
    }

    public loadMore() {
        if (this.globalTopicsQuery.isFetchingNextPage()) return;
        this.globalTopicsQuery.fetchNextPage();
    }

    public onSearchValueChange(searchValue: string): void {
        this.topicsService.setSearchText(searchValue);
    }

    public onCategorySelected(category: string): void {
        this.topicsService.setCategory(category);
    }
}
