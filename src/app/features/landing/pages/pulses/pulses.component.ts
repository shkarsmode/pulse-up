import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AngularSvgIconModule } from "angular-svg-icon";
import { toSignal } from "@angular/core/rxjs-interop";
import { InfiniteScrollDirective } from "ngx-infinite-scroll";
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
        PrimaryButtonComponent,
        AngularSvgIconModule,
    ],
    providers: [InfiniteLoaderService, PulsesPaginationService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PulsesComponent implements OnInit {
    private readonly votesService = inject(VotesService);
    public readonly topicsService = inject(TopicsService);

    public userVotesMap = toSignal(this.votesService.votesByTopicId$);
    public suggestTopicRoute = "/" + AppRoutes.User.Topic.SUGGEST;
    public globalTopicsQuery = this.topicsService.globalTopicsQuery;
    public localTopicsQuery = this.topicsService.localTopicsQuery;

    public categories = this.topicsService.categories;
    public localTopics = this.topicsService.localTopics;
    public isEmptyGlobalTopics = this.topicsService.isEmptyGlobalTopics;
    public isEmptyLocalTopics = this.topicsService.isEmptyLocalTopics;

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
        this.refetchQueries();
        this.topicsService.syncFiltersWithQueryParams();
        if (this.selectedCategory === "trending" && this.isEmptyLocalTopics()) {
            console.log("Switching to newest category because local topics are empty");
            this.topicsService.setCategory("newest");
        }
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

    private refetchQueries() {
        const localTopics = this.localTopicsQuery.data();
        const globalTopics = this.globalTopicsQuery.data()?.pages.flat();

        if (localTopics) {
            this.localTopicsQuery.refetch();
        }
        if (globalTopics) {
            this.globalTopicsQuery.refetch();
        }
    }
}
