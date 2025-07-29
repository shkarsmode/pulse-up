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

    private readonly count = 10;
    private filter = new BehaviorSubject<ILeaderboardFilter>({
        date: new Date().toISOString(),
        timeframe: "Month",
    });

    public isLoading = false;
    public isError = false;
    public filter$ = this.filter.asObservable();
    public topics$ = this.filter$.pipe(
        tap(() => {
            this.isLoading = true;
            this.isError = false;
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
            this.isError = true;
            this.isLoading = false;
            return of(null);
        }),
        tap(() => {
            this.isLoading = false;
        }),
        map((data) => data?.results || null)
    );

    public setFilter(filter: Partial<ILeaderboardFilter>) {
        this.filter.next({ ...this.filter.getValue(), ...filter });
    }
}
