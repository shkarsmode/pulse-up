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
    public readonly startTimeframe: LeaderboardTimeframe = "Day";

    private readonly count = 10;
    private filterSubject = new BehaviorSubject<ILeaderboardFilter>({
        date: this.startDate.toISOString(),
        timeframe: this.startTimeframe,
    });
    private _isLoading = false;
    private _isError = false;
    
    public get isLoading() {
        return this._isLoading;
    }
    public get isError() {
        return this._isError;
    }
    public filter$ = this.filterSubject.asObservable();
    public topics$ = this.filter$.pipe(
        tap(() => {
            this._isLoading = true;
            this._isError = false;
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
            this._isError = true;
            this._isLoading = false;
            return of(null);
        }),
        tap(() => {
            this._isLoading = false;
        }),
        map((data) => data?.results || null),
    );

    public setFilter(filter: Partial<ILeaderboardFilter>) {
        this.filterSubject.next({ ...this.filterSubject.getValue(), ...filter });
    }
}
