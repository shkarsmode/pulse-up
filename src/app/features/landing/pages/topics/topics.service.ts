import { computed, inject, Injectable, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { injectInfiniteQuery } from "@tanstack/angular-query-experimental";
import { combineLatest, lastValueFrom, map, shareReplay, tap } from "rxjs";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { AppConstants, QUERY_KEYS } from "@/app/shared/constants";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { PendingTopicsService } from "@/app/shared/services/topic/pending-topics.service";
import { StringUtils } from "@/app/shared/helpers/string-utils";
import { TrendingTopicsService } from "../../services/trending-topics/trending-topics.service";
import { ITopic, TopicState } from "@/app/shared/interfaces";

@Injectable({ providedIn: "root" })
export class TopicsService {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private pulseService = inject(PulseService);
    private pendingTopicsService = inject(PendingTopicsService);
    private trendingTopicsService = inject(TrendingTopicsService);

    private searchTextSignal = signal("");
    private searchText$ = toObservable(this.searchTextSignal);
    private categorySignal = signal<string>(AppConstants.DEFAULT_CATEGORIES[0]);
    private trendingTopicsSignal = signal<ITopic[] | null>(null);
    private isTrendingTopicsLoadingSignal = signal(false);
    private trendingTopics$ = toObservable(this.trendingTopicsSignal);

    public searchText = this.searchTextSignal.asReadonly();
    public category = this.categorySignal.asReadonly();
    public isTrendingTopicsLoading = this.isTrendingTopicsLoadingSignal.asReadonly();
    public categories = toSignal(
        this.pulseService.categories$.pipe(
            map((categories) => categories.map((category) => category.name)),
            map((categories) => [...AppConstants.DEFAULT_CATEGORIES, ...categories]),
        ),
        {
            initialValue: [],
        },
    );

    public globalTopicsQuery = injectInfiniteQuery(() => ({
        queryKey: [
            QUERY_KEYS.topics,
            this.searchText(),
            this.category(),
            this.pendingTopicsService.pendingTopicsIds(),
        ],
        queryFn: async ({ pageParam }) => {
            const category = this.category();
            const globalTopics = await lastValueFrom(
                this.pulseService
                    .get({
                        keyword: this.searchText(),
                        category: category === "newest" ? undefined : category,
                        take: 20,
                        skip: pageParam * 20,
                        state: this.searchText() ? TopicState.All : TopicState.Active,
                    })
                    .pipe(shareReplay({ bufferSize: 1, refCount: true })),
            );
            return globalTopics;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            if (lastPage?.length === 0) {
                return undefined;
            }
            return lastPageParam + 1;
        },
        enabled: this.category() !== "trending",
    }));

    public trendingTopics = toSignal(
        combineLatest([this.trendingTopics$, this.searchText$]).pipe(
            map(([topics, searchText]) => {
                const searchTextNormalized = StringUtils.normalizeWhitespace(
                    searchText.toLowerCase(),
                );
                if (searchTextNormalized && topics) {
                    return topics.filter(
                        (topic) =>
                            topic.title.toLowerCase().includes(searchTextNormalized) ||
                            topic.keywords.some((keyword) =>
                                keyword.toLowerCase().includes(searchTextNormalized),
                            ),
                    );
                }
                return topics;
            }),
        ),
    );

    public isEmptyGlobalTopics = computed(() => {
        const isLoading = this.globalTopicsQuery.isLoading();
        const hasTopics = this.globalTopicsQuery.data()?.pages.flat().length !== 0;
        return !isLoading && !hasTopics;
    });

    public isEmptyTrendingTopics = computed(() => {
        const trendingTopics = this.trendingTopics();
        const isLoading = this.isTrendingTopicsLoadingSignal();
        return !isLoading && trendingTopics && !trendingTopics.length;
    });

    constructor() {
        this.loadTrendingTopics().then((topics) => {
            this.trendingTopicsSignal.set(topics);
        });
    }

    public setSearchText(text: string) {
        this.searchTextSignal.set(text);
        this.updateQueryParams();
    }

    public setCategory(category: string) {
        this.categorySignal.set(category);
        this.updateQueryParams();
    }

    public syncFiltersWithQueryParams() {
        const params = this.route.snapshot.queryParamMap;
        const search = params.get("search");
        const category = params.get("category");
        if (search !== null) {
            this.setSearchText(search);
        }
        if (category !== null) {
            this.setCategory(category);
        }
    }

    public refetchTopics() {
        const globalTopics = this.globalTopicsQuery.data()?.pages.flat();
        if (globalTopics) {
            this.globalTopicsQuery.refetch();
        }

        const trendingTopics = this.trendingTopicsSignal();
        if (trendingTopics) {
            this.reloadTrendingTopics().then((topics) => {
                this.trendingTopicsSignal.set(topics);
            });
        }
    }

    private updateQueryParams() {
        const search = this.searchText();
        const category = this.category();
        const queryParams: Record<string, string> = {};

        if (search.length) {
            queryParams["search"] = search;
        }
        if (category) {
            queryParams["category"] = category;
        }
        this.router.navigate([], {
            queryParams,
            queryParamsHandling: "replace",
        });
    }

    private async loadTrendingTopics() {
        try {
            this.isTrendingTopicsLoadingSignal.set(true);
            return await this.trendingTopicsService.getTopics();
        } catch (error) {
            console.log("Error fetching trending topics:", error);
            return [] as ITopic[];
        } finally {
            this.isTrendingTopicsLoadingSignal.set(false);
        }
    }

    private async reloadTrendingTopics() {
        try {
            return await this.trendingTopicsService.getTopics();
        } catch (error) {
            console.log("Error fetching trending topics:", error);
            return [] as ITopic[];
        }
    }
}
