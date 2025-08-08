import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, catchError, map, of, switchMap, tap } from "rxjs";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { LeaderboardTimeframe } from "../interface/leaderboard-timeframe.interface";

interface ILeaderboardFilter {
    date: string;
    timeframe: LeaderboardTimeframe;
}

@Injectable({
    providedIn: "root",
})
export class LeaderboardService {
    private pulseService = inject(PulseService);

    public readonly startDate = new Date();
    public readonly startTimeframe: LeaderboardTimeframe = "Month";

    private readonly count = 10;
    private filterSubject = new BehaviorSubject<ILeaderboardFilter>({
        date: this.startDate.toISOString(),
        timeframe: this.startTimeframe,
    });
    private isLoadingSubject = new BehaviorSubject<boolean>(false);
    private isErrorSubject = new BehaviorSubject<boolean>(false);

    public isLoading$ = this.isLoadingSubject.asObservable();
    public isError$ = this.isErrorSubject.asObservable();
    public filter$ = this.filterSubject.asObservable();
    public topics$ = this.filter$.pipe(
        tap(() => {
            this.isLoadingSubject.next(true);
            this.isErrorSubject.next(false);
        }),
        switchMap((filter) => {
            return this.pulseService.getLeaderboardTopics({
                count: this.count,
                date: filter.date,
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
        }),
        map((data) => data?.results || null),
    );

    public setFilter(filter: Partial<ILeaderboardFilter>) {
        this.filterSubject.next({ ...this.filterSubject.getValue(), ...filter });
    }
}
