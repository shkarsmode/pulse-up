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
import { getTimeframeStatus } from "../../helpers/getTimeframeStatus";
import {
    ILeaderboardFilter,
    ILeaderboardLocationOption,
    ILeaderboardTempFilter,
} from "../../interfaces/leaderboard-filter.interface";

const initialTempFilter: ILeaderboardTempFilter = {
    date: null,
    timeframe: "last24Hours",
    location: {
        id: "global",
        label: "Global",
        type: "quickPick",
        data: {
            country: null,
            region: null,
            city: null,
        },
    },
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
            return (
                prev.date.getTime() === curr.date.getTime() &&
                prev.timeframe === curr.timeframe &&
                (prev.location?.country === curr.location?.country ||
                    prev.location?.region === curr.location?.region ||
                    prev.location?.city === curr.location?.city)
            );
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
                ...(filter.location?.country && { "Location.Country": filter.location.country }),
                ...(filter.location?.region && { "Location.Region": filter.location.region }),
                ...(filter.location?.city && { "Location.City": filter.location.city }),
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

    public setLocation(location: ILeaderboardLocationOption) {
        const currentFilters = this.tempFilters.getValue();
        this.tempFilters.next({
            ...currentFilters,
            location,
        });
    }

    public applyFilters() {
        const { date, timeframe, location } = this.tempFilters.getValue();
        this.filters.next({
            date: date || new Date(),
            timeframe,
            location: {
                country: location.data.country,
                region: location.data.region,
                city: location.data.city,
            },
        });
    }

    public updateTimeframeStatus() {
        const { date, timeframe } = this.filters.getValue();
        const status = getTimeframeStatus(date, timeframe);
        this.timeframeStatus.next(status);
    }
}
