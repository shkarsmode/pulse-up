import { computed, inject, Injectable, signal } from "@angular/core";
import { injectInfiniteQuery, injectQuery } from "@tanstack/angular-query-experimental";
import { concat, first, lastValueFrom, map, of, shareReplay, switchMap } from "rxjs";
import { toSignal } from "@angular/core/rxjs-interop";
import { geoToH3 } from "h3-js";
import { QUERY_KEYS } from "@/app/shared/constants";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { PendingTopicsService } from "@/app/shared/services/topic/pending-topics.service";
import { IpLocationService } from "@/app/shared/services/core/ip-location.service";
import { StringUtils } from "@/app/shared/helpers/string-utils";
import { ITopic } from "@/app/shared/interfaces";

@Injectable({ providedIn: "root" })
export class TopicsService {
    private pulseService = inject(PulseService);
    private pendingTopicsService = inject(PendingTopicsService);
    private readonly ipLocationService = inject(IpLocationService);

    private searchTextSignal = signal("");
    private categorySignal = signal<string>("trending");

    public searchText = this.searchTextSignal.asReadonly();
    public category = this.categorySignal.asReadonly();
    public categories = toSignal(
        this.pulseService.categories$.pipe(
            map((categories) => categories.map((category) => category.name)),
            map((categories) => ["trending", "newest", ...categories]),
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

    public localTopicsQuery = injectQuery(() => ({
        queryKey: [
            QUERY_KEYS.topics,
            this.category(),
            this.pendingTopicsService.pendingTopicsIds(),
        ],
        queryFn: () => lastValueFrom(this.getLocalTopics()),
        enabled: this.category() === "trending",
    }));

    public localTopics = computed(() => {
        const localTopics = this.localTopicsQuery.data() || [];
        const searchText = this.searchText();
        const searchTextNormalized = StringUtils.normalizeWhitespace(searchText.toLowerCase());
        if (searchText) {
            return localTopics.filter(
                (topic) =>
                    topic.title.toLowerCase().includes(searchTextNormalized) ||
                    topic.keywords.some((keyword) =>
                        keyword.toLowerCase().includes(searchTextNormalized),
                    ),
            );
        }
        return localTopics;
    });

    public isEmptyGlobalTopics = computed(() => {
        const isLoading = this.globalTopicsQuery.isLoading();
        const hasTopics = this.globalTopicsQuery.data()?.pages.flat().length !== 0;
        return !isLoading && !hasTopics;
    });

    public isEmptyLocalTopics = computed(() => {
        const isLoading = this.localTopicsQuery.isLoading();
        const hasLocalTopics = !!this.localTopics().length;
        console.log({ isLoading, hasLocalTopics });
        
        return !isLoading && !hasLocalTopics;
    });

    public setSearchText(text: string) {
        this.searchTextSignal.set(text);
    }

    public setCategory(category: string) {
        this.categorySignal.set(category);
    }

    private getLocalTopics() {
        return this.ipLocationService.countryCoodinates$.pipe(
            map(({ latitude, longitude }) => geoToH3(latitude, longitude, 0)),
            switchMap((h3Index) => {
                return concat(this.pulseService.getTopicsByCellIndex(h3Index)).pipe(
                    first((topics) => topics.length > 0, []),
                );
            }),
            switchMap((topics) => {
                if (topics.length === 0) return of([]);
                const topicsIds = topics.map(({ id }) => id);
                return this.pulseService.get({
                    id: topicsIds,
                });
            }),
            map(() => [] as  ITopic[]),
            shareReplay({ bufferSize: 1, refCount: true }),
        );
    }
}
