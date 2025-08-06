import { inject, Injectable } from "@angular/core";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import {
    BehaviorSubject,
    combineLatest,
    distinctUntilChanged,
    map,
    scan,
    shareReplay,
    startWith,
    switchMap,
    tap,
    withLatestFrom,
} from "rxjs";
import { AppConstants } from "@/app/shared/constants";
import { ITopic } from "@/app/shared/interfaces";
import { ICategory } from "@/app/shared/interfaces/category.interface";

@Injectable()
export class PulsesPaginationService {
    private pulseService = inject(PulseService);

    private currentPageSubject = new BehaviorSubject(1);
    private searchTextSubject = new BehaviorSubject<string>("");
    private categoryFilterSubject = new BehaviorSubject<ICategory | null>(null);
    private hasMorePages = true;

    private loadingSubject = new BehaviorSubject(false);
    private currentPageLoadingSubject = new BehaviorSubject<number | null>(null);

    private filtersChanged$ = combineLatest([
        this.searchTextSubject,
        this.categoryFilterSubject,
    ]).pipe(
        distinctUntilChanged((a, b) => a[0] === b[0] && a[1]?.name === b[1]?.name),
        shareReplay({ bufferSize: 1, refCount: true }),
    );

    private pageData$ = combineLatest([
        this.currentPageSubject,
        this.searchTextSubject,
        this.categoryFilterSubject,
    ]).pipe(
        tap(([page]) => {
            this.currentPageLoadingSubject.next(page);
            this.loadingSubject.next(true);
        }),
        switchMap(([currentPage, searchText, category]) => {
            return this.pulseService
                .get({
                    keyword: searchText,
                    category: category ? category.name : undefined,
                    take: AppConstants.PULSES_PER_PAGE,
                    skip: AppConstants.PULSES_PER_PAGE * (currentPage - 1),
                })
                .pipe(
                    tap((topics) => {
                        this.hasMorePages = topics.length === AppConstants.PULSES_PER_PAGE;
                        this.loadingSubject.next(false);
                    }),
                );
        }),
        withLatestFrom(this.filtersChanged$.pipe(startWith(null))),
        scan(
            (acc, [newTopics, resetMarker]) => {
                const shouldReset = resetMarker !== acc.lastResetMarker;
                return {
                    topics: shouldReset ? newTopics : [...acc.topics, ...newTopics],
                    lastResetMarker: resetMarker,
                };
            },
            { topics: [] as ITopic[], lastResetMarker: null as unknown },
        ),
        map((state) => state.topics),
    );

    public topics$ = this.pageData$;

    public initialLoading$ = combineLatest([this.currentPageSubject, this.loadingSubject]).pipe(
        map(([page, isLoading]) => page === 1 && isLoading),
        distinctUntilChanged(),
    );

    public paginationLoading$ = combineLatest([this.currentPageSubject, this.loadingSubject]).pipe(
        map(([page, isLoading]) => page > 1 && isLoading),
        distinctUntilChanged(),
    );

    public loadMore(): void {
        if (this.hasMorePages && !this.loadingSubject.value) {
            this.currentPageSubject.next(this.currentPageSubject.value + 1);
        }
    }

    public setSearchText(searchText: string): void {
        this.searchTextSubject.next(searchText);
        this.currentPageSubject.next(1);
    }

    public setCategoryFilter(category: ICategory | null): void {
        this.categoryFilterSubject.next(category);
        this.currentPageSubject.next(1);
    }
}
