import { inject, Injectable, signal } from "@angular/core";
import { injectInfiniteQuery } from "@tanstack/angular-query-experimental";
import { lastValueFrom, shareReplay } from "rxjs";
import { QUERY_KEYS } from "@/app/shared/constants";
import { ICategory } from "@/app/shared/interfaces/category.interface";
import { PulseService } from "@/app/shared/services/api/pulse.service";

@Injectable({ providedIn: "root" })
export class TopicsService {
    private pulseService = inject(PulseService);

    private searchTextSignal = signal("");
    private categorySignal = signal<ICategory | null>(null);

    public searchText = this.searchTextSignal.asReadonly();
    public category = this.categorySignal.asReadonly();

    public topics = injectInfiniteQuery(() => ({
        queryKey: [QUERY_KEYS.topics, this.searchText(), this.category()?.name],
        queryFn: async ({ pageParam }) => {
            const category = this.category();
            return lastValueFrom(
                this.pulseService.get({
                    keyword: this.searchText(),
                    category: category ? category.name : undefined,
                    take: 10,
                    skip: pageParam * 10,
                }).pipe(
                    shareReplay({ bufferSize: 1, refCount: true }),
                ),
            );
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            if (lastPage?.length === 0) {
                return undefined;
            }
            return lastPageParam + 1;
        },
    }));

    public setSearchText(text: string) {
        this.searchTextSignal.set(text);
    }   

    public setCategory(category: ICategory | null) {
        this.categorySignal.set(category);
    }
}
