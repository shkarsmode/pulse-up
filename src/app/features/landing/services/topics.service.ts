import { inject, Injectable, signal } from "@angular/core";
import { injectInfiniteQuery } from "@tanstack/angular-query-experimental";
import { lastValueFrom, map, shareReplay } from "rxjs";
import { QUERY_KEYS } from "@/app/shared/constants";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { PendingTopicsService } from "@/app/shared/services/topic/pending-topics.service";
import { toSignal } from "@angular/core/rxjs-interop";

@Injectable({ providedIn: "root" })
export class TopicsService {
    private pulseService = inject(PulseService);
    private pendingTopicsService = inject(PendingTopicsService);

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
            initialValue: []
        }
    );

    public globalTopics = injectInfiniteQuery(() => ({
        queryKey: [
            QUERY_KEYS.topics,
            this.searchText(),
            this.category(),
            this.pendingTopicsService.pendingTopicsIds(),
        ],
        queryFn: async ({ pageParam }) => {
            const category = this.category();
            return lastValueFrom(
                this.pulseService
                    .get({
                        keyword: this.searchText(),
                        category: category === "newest" ? undefined : category,
                        take: 10,
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

    public setSearchText(text: string) {
        this.searchTextSignal.set(text);
    }

    public setCategory(category: string) {
        this.categorySignal.set(category);
    }
}
