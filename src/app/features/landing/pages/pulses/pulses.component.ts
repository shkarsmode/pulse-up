import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    inject,
    OnInit,
} from "@angular/core";
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
import { TopicsService } from "../../services/topics.service";
import { StringUtils } from "@/app/shared/helpers/string-utils";

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
    public get isEmptyGlobalTopics() {
        return (
            !this.globalTopicsQuery.isLoading() &&
            this.globalTopicsQuery.data()?.pages.flat().length === 0
        );
    }
    public get isEmptyLocalTopics() {
        return !this.localTopicsQuery.isLoading() && this.localTopicsQuery.data()?.length === 0;
    }
    public localTopics = computed(() => {
        const localTopics = this.localTopicsQuery.data() || [];
        const searchText = StringUtils.normalizeWhitespace(this.searchText.toLowerCase());
        if (searchText) {
            return localTopics.filter(
                (topic) =>
                    topic.title.toLowerCase().includes(searchText) ||
                    topic.keywords.some((keyword) => keyword.toLowerCase().includes(searchText)),
            );
        }
        return localTopics;
    });

    constructor() {
        effect(() => {
            console.log({
                isEmptyLocalTopics: this.isEmptyLocalTopics,
                isLoading: this.localTopicsQuery.isLoading(),
                data: this.localTopicsQuery.data(),
            });
        });
    }

    public ngOnInit() {
        this.refetchQueries();
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
