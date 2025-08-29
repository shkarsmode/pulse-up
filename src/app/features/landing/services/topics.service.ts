import { inject, Injectable, signal } from "@angular/core";
import { injectInfiniteQuery, injectQuery } from "@tanstack/angular-query-experimental";
import { lastValueFrom, map, shareReplay, tap } from "rxjs";
import { QUERY_KEYS } from "@/app/shared/constants";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { PendingTopicsService } from "@/app/shared/services/topic/pending-topics.service";
import { IpLocationService } from "@/app/shared/services/core/ip-location.service";
import { ITopic } from "@/app/shared/interfaces";

@Injectable({ providedIn: "root" })
export class TopicsService {
    private pulseService = inject(PulseService);
    private pendingTopicsService = inject(PendingTopicsService);
    private ipLocationService = inject(IpLocationService);

    private searchTextSignal = signal("");
    private categorySignal = signal<string>("trending");

    public searchText = this.searchTextSignal.asReadonly();
    public category = this.categorySignal.asReadonly();

    public topics = injectInfiniteQuery(() => ({
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
                        category: this.category() === "Newest" ? undefined : this.category(),
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
            // return lastValueFrom(
            //     this.ipLocationService.location$.pipe(
            //         tap((location) => {
            //             console.log("location", location);
            //         }),
            //         map(() => [] as ITopic[]),
            //         shareReplay({ bufferSize: 1, refCount: true }),
            //     ),
            // );
        },
        // initialPageParam: 0,
        // getNextPageParam: (lastPage, allPages, lastPageParam) => {
        //     if (lastPage?.length === 0) {
        //         return undefined;
        //     }
        //     return lastPageParam + 1;
        // },
        enabled: this.category() === "trending",
    }));

    public setSearchText(text: string) {
        this.searchTextSignal.set(text);
    }

    public setCategory(category: string) {
        this.categorySignal.set(category);
    }
}
