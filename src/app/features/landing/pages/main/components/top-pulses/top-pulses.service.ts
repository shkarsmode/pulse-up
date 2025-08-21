import { Injectable, inject, signal } from "@angular/core";
import { catchError, concat, finalize, first, map, of, shareReplay } from "rxjs";
import { ILeaderboardTopicData, LeaderboardTimeframe } from "@/app/shared/interfaces";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { toSignal } from "@angular/core/rxjs-interop";

@Injectable({
    providedIn: "root",
})
export class TopPulsesService {
    private pulseService = inject(PulseService);

    isLoading = signal(true);
    isError = signal(false);
    topics = toSignal(this.getTopicsWithFallback(), {
        initialValue: [] as ILeaderboardTopicData[],
    });

    private getTopics(timeframe: LeaderboardTimeframe | "last24Hours", date?: string) {
        return this.pulseService
            .getLeaderboardTopics({
                count: 3,
                timeframe,
                date: date || "",
                includeTopicDetails: true,
            })
            .pipe(map((response) => response.results));
    }

    private getTopicsWithFallback() {
        return concat(
            this.getTopics("last24Hours"),
            this.getTopics("Day", new Date(Date.now() - 86400000).toISOString()),
            this.getTopics("Week", new Date().toISOString()),
        ).pipe(
            first((topics) => topics.length === 3, [] as ILeaderboardTopicData[]),
            catchError(() => {
                this.isError.set(true);
                return of([] as ILeaderboardTopicData[]);
            }),
            shareReplay({ bufferSize: 1, refCount: true }),
            finalize(() => {
                console.log("finalize");
                this.isLoading.set(false);
            }),
        );
    }
}
