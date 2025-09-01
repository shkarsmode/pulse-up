import { inject, Injectable, signal } from "@angular/core";
import { injectInfiniteQuery, injectQuery } from "@tanstack/angular-query-experimental";
import { lastValueFrom, map, shareReplay, switchMap } from "rxjs";
import * as h3 from "h3-js";
import { QUERY_KEYS } from "@/app/shared/constants";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { PendingTopicsService } from "@/app/shared/services/topic/pending-topics.service";
import { IpLocationService } from "@/app/shared/services/core/ip-location.service";
import { IFilterCategory } from "@/app/shared/interfaces/category.interface";
import { ITopic } from "@/app/shared/interfaces";
import { StringUtils } from "@/app/shared/helpers/string-utils";

@Injectable({ providedIn: "root" })
export class TopicsService {
    private pulseService = inject(PulseService);
    private pendingTopicsService = inject(PendingTopicsService);
    private ipLocationService = inject(IpLocationService);

    private searchTextSignal = signal("");
    private categorySignal = signal<IFilterCategory>("trending");

    public searchText = this.searchTextSignal.asReadonly();
    public category = this.categorySignal.asReadonly();

    public globalTopics = injectInfiniteQuery(() => ({
        queryKey: [
            QUERY_KEYS.topics,
            this.searchText(),
            this.category(),
            this.pendingTopicsService.pendingTopicsIds(),
        ],
        queryFn: async ({ pageParam }) => {
            return lastValueFrom(
                this.pulseService
                    .get({
                        keyword: this.searchText(),
                        category: this.category() === "newest" ? undefined : this.category(),
                        skip: pageParam * 10,
                    })
                    .pipe(shareReplay({ bufferSize: 1, refCount: true })),
            );
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

    public localTopics = injectQuery(() => ({
        queryKey: [
            QUERY_KEYS.topics,
            this.searchText(),
            this.category(),
            this.pendingTopicsService.pendingTopicsIds(),
        ],
        queryFn: async () => {
            const searchText = StringUtils.normalizeWhitespace(this.searchText());
            return lastValueFrom(
                this.topicsByCellIndex$.pipe(
                    map((topics) => this.filterTopicsBySearchText(topics, searchText))
                )
            );
        },
        enabled: this.category() === "trending",
    }));

    public setSearchText(text: string) {
        this.searchTextSignal.set(text);
    }

    public setCategory(category: IFilterCategory) {
        this.categorySignal.set(category);
    }

    private topicsByCellIndex$ = this.ipLocationService.coordinates$.pipe(
        map(({ longitude, latitude }) => h3.geoToH3(latitude, longitude, 0)),
        switchMap((h3Index) => this.pulseService.getTopicsByCellIndex(h3Index)),
    );

    private filterTopicsBySearchText(topics: ITopic[], searchText: string): ITopic[] {
        if (!searchText) return topics;
        return topics.filter(({ title, keywords }) => {
            return !!title.includes(searchText) || keywords.some((keyword) => keyword.includes(searchText));
        });
    }
}
