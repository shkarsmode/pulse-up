import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, switchMap, scan, tap, map } from "rxjs";
import { IPaginator } from "@/app/shared/interfaces";

@Injectable()
export class InfiniteLoaderService<T> {
    private loadingSubject = new BehaviorSubject(true);
    private page$ = new BehaviorSubject(1);
    private loadFn: (page: number) => Observable<IPaginator<T>>;
    private transformFn: (response: IPaginator<T>) => IPaginator<T> = (res) => res;
    public paginator$: Observable<IPaginator<T>>;
    public loading$ = this.loadingSubject.asObservable();

    public init({
        load,
        transform,
    }: {
        load: (page: number) => Observable<IPaginator<T>>;
        transform?: (response: IPaginator<T>) => IPaginator<T>;
    }) {
        this.loadFn = load;
        this.transformFn = transform ?? ((res) => res);
        this.paginator$ = this.page$.pipe(
            tap(() => this.loadingSubject.next(true)),
            switchMap((page) => {
                return this.loadFn(page).pipe(map(this.transformFn));
            }),
            scan(this.updatePaginator, {
                items: [],
                page: 0,
                hasMorePages: true,
            } as IPaginator<T>),
            tap(() => this.loadingSubject.next(false)),
        );
    }

    public loadMore(paginator: IPaginator<T>) {
        if (!paginator.hasMorePages) {
            return;
        }
        this.page$.next(paginator.page + 1);
    }

    private updatePaginator(
        accumulator: IPaginator<T>,
        value: IPaginator<T>,
    ): IPaginator<T> {
        if (value.page === 1) {
            return value;
        }

        accumulator.items.push(...value.items);
        accumulator.page = value.page;
        accumulator.hasMorePages = value.hasMorePages;

        return accumulator;
    }
}
