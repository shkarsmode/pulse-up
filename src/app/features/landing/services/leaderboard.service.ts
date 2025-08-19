import { inject, Injectable } from "@angular/core";
import {
    BehaviorSubject,
    catchError,
    distinctUntilChanged,
    map,
    of,
    shareReplay,
    switchMap,
    tap,
} from "rxjs";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { LeaderboardTimeframeExtended, LeaderboardTimeframeStatus } from "@/app/shared/interfaces";
import { getTimeframeStatus } from "../helpers/getTimeframeStatus";

interface ILeaderboardTempFilter {
    date: Date | null;
    timeframe: LeaderboardTimeframeExtended;
}

interface ILeaderboardFilter {
    date: Date;
    timeframe: LeaderboardTimeframeExtended;
}

const initialTempFilter: ILeaderboardTempFilter = {
    date: null,
    timeframe: "last24Hours",
};

const initialFilter: ILeaderboardFilter = {
    date: new Date(),
    timeframe: "last24Hours",
};

@Injectable({
    providedIn: "root",
})
export class LeaderboardService {
    private pulseService = inject(PulseService);

    private readonly count = 10;
    private tempFilters = new BehaviorSubject<ILeaderboardTempFilter>(initialTempFilter);
    private filters = new BehaviorSubject<ILeaderboardFilter>(initialFilter);
    private timeframeStatus = new BehaviorSubject<LeaderboardTimeframeStatus | null>(null);
    private isLoadingSubject = new BehaviorSubject<boolean>(false);
    private isErrorSubject = new BehaviorSubject<boolean>(false);

    public isLoading$ = this.isLoadingSubject.asObservable();
    public isError$ = this.isErrorSubject.asObservable();
    public filters$ = this.filters.asObservable();
    public tempFilters$ = this.tempFilters.asObservable();
    public timeframeStatus$ = this.timeframeStatus.asObservable();
    public topics$ = this.filters.pipe(
        distinctUntilChanged((prev, curr) => {
            return prev.date.getTime() === curr.date.getTime() && prev.timeframe === curr.timeframe;
        }),
        tap(() => {
            this.isLoadingSubject.next(true);
            this.isErrorSubject.next(false);
        }),
        switchMap((filter) => {
            return this.pulseService.getLeaderboardTopics({
                count: this.count,
                date: filter.date.toDateString(),
                timeframe: filter.timeframe,
                includeTopicDetails: true,
            });
        }),
        catchError(() => {
            this.isErrorSubject.next(true);
            this.isLoadingSubject.next(false);
            return of(null);
        }),
        tap(() => {
            this.isLoadingSubject.next(false);
            this.updateTimeframeStatus();
        }),
        map((data) => data?.results || null),
        shareReplay({ bufferSize: 1, refCount: true }),
    );

    public setDate(date: Date | null) {
        this.tempFilters.next({
            ...this.tempFilters.getValue(),
            date,
        });
    }

    public setTimeframe(timeframe: LeaderboardTimeframeExtended) {
        this.tempFilters.next({
            ...this.tempFilters.getValue(),
            timeframe,
        });
    }

    public applyFilters() {
        const { date, timeframe } = this.tempFilters.getValue();
        if (!date) return;
        this.filters.next({ date, timeframe });
    }

    public updateTimeframeStatus() {
        const { date, timeframe } = this.filters.getValue();
        const status = getTimeframeStatus(date, timeframe);
        this.timeframeStatus.next(status);
    }
}
