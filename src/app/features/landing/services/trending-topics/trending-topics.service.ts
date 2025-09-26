import { inject, Injectable } from "@angular/core";
import { CellTopicsProvider } from "./providers/cell-topics-provider";
import { NearestCellsTopicsProvider } from "./providers/nearest-cells-topics-provider";
import { LeaderboardTopicsProvider } from "./providers/leaderboard-topics-provider";

@Injectable({
    providedIn: "root",
})
export class TrendingTopicsService {
    private cellTopicsProvider = inject(CellTopicsProvider);
    private nearestCellsTopicsProvider = inject(NearestCellsTopicsProvider);
    private leaderboardTopicsProvider = inject(LeaderboardTopicsProvider);

    constructor() {
        this.cellTopicsProvider
            .setNext(this.nearestCellsTopicsProvider)
            .setNext(this.leaderboardTopicsProvider);
    }

    public getTopics() {
        return this.cellTopicsProvider.handle();
    }
}
