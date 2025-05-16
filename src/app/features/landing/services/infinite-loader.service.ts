import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, switchMap, scan, tap, map } from "rxjs";
import { PaginatorResponse } from "../interfaces/pagination-response.interface";

@Injectable()
export class InfiniteLoaderService<T> {
    public paginator$: Observable<PaginatorResponse<T>>;
    public loading$ = new BehaviorSubject(true);
    private page$ = new BehaviorSubject(1);
    private loadFn: (page: number) => Observable<PaginatorResponse<T>>;
    private transformFn: (response: PaginatorResponse<T>) => PaginatorResponse<T> = (res) => res;

    public init({
        load,
        transform,
    }: {
        load: (page: number) => Observable<PaginatorResponse<T>>;
        transform?: (response: PaginatorResponse<T>) => PaginatorResponse<T>;
    }) {
        this.loadFn = load;
        this.transformFn = transform ?? ((res) => res);
        this.paginator$ = this.page$.pipe(
            tap(() => this.loading$.next(true)),
            switchMap((page) => {
                return this.loadFn(page).pipe(map(this.transformFn));
            }),
            scan(this.updatePaginator, {
                items: [],
                page: 0,
                hasMorePages: true,
            } as PaginatorResponse<T>),
            tap(() => this.loading$.next(false)),
        );
    }

    public loadMore(paginator: PaginatorResponse<T>) {
        if (!paginator.hasMorePages) {
            return;
        }
        this.page$.next(paginator.page + 1);
    }

    private updatePaginator(
        accumulator: PaginatorResponse<T>,
        value: PaginatorResponse<T>,
    ): PaginatorResponse<T> {
        if (value.page === 1) {
            return value;
        }

        accumulator.items.push(...value.items);
        accumulator.page = value.page;
        accumulator.hasMorePages = value.hasMorePages;

        return accumulator;
    }
}
