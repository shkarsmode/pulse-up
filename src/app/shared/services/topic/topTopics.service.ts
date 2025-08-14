import { inject, Injectable } from "@angular/core";
import { PulseService } from "../api/pulse.service";
import { concat, first, map } from "rxjs";
import { ILeaderboardTopicData, LeaderboardTimeframe } from "../../interfaces";

@Injectable({
    providedIn: "root",
})
export class TopTopicsService {
    private pulseService = inject(PulseService);

    public topics$ = this.getTopicsWithFallback();

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
        );
    }
}
