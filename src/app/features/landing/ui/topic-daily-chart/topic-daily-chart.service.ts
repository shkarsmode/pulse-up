import { computed, inject, Injectable, signal } from "@angular/core";
import { injectQuery } from "@tanstack/angular-query-experimental";
import { firstValueFrom } from "rxjs";
import { QUERY_KEYS } from "@/app/shared/constants";
import { DateUtils } from "@/app/shared/helpers/date-utils";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { PendingTopicsService } from "@/app/shared/services/topic/pending-topics.service";
import { TopicStatsUnit } from "@/app/shared/interfaces";
import { normalizeTopicStatsResponse } from "../../helpers/normalizeTopicStatsResponse";
import { toCumulative } from "../../helpers/toCumulative";

@Injectable({
    providedIn: "root",
})
export class TopicDailyChartService {
    private pulseService = inject(PulseService);
    private pendingTopicsService = inject(PendingTopicsService);

    private topicId = signal<number | null>(null);
    private isCumulativeMode = signal<boolean>(true);
    private readonly unit: TopicStatsUnit = "daily";

    public setTopicId(id: number) {
        this.topicId.set(id);
    }

    public setCumulativeMode(isCumulative: boolean) {
        this.isCumulativeMode.set(isCumulative);
    }

    private topicStatsQuery = injectQuery(() => ({
        queryFn: async () => {
            const topicId = this.topicId();
            if (!topicId) return;
            const response = await firstValueFrom(
                this.pulseService.getTopicsStats(topicId, this.unit),
            );

            const normalizedResponse = normalizeTopicStatsResponse(response);

            const processingTopic = this.pendingTopicsService.get(topicId);

            const votesByTime = processingTopic?.votingHistory?.[this.unit];

            if (votesByTime) {
                for (const [date, votes] of Object.entries(votesByTime)) {
                    normalizedResponse[date] = (normalizedResponse[date] || 0) + votes;
                }
            }

            return normalizedResponse;
        },
        queryKey: [
            QUERY_KEYS.topicStats,
            this.topicId(),
            this.unit,
            this.pendingTopicsService.pendingTopicsIds(),
        ],
        enabled: !!this.topicId(),
    }));

    public isLoading = computed(() => this.topicStatsQuery.isLoading());

    public data = computed(() => {
        const data = this.topicStatsQuery.data() || {};
        const isCumulative = this.isCumulativeMode();
        const votes = Object.values(data).reverse();
        return isCumulative ? toCumulative(votes) : votes;
    });

    public labels = computed(() => {
        const data = this.topicStatsQuery.data() || {};
        const labels = Object.keys(data)
            .reverse()
            .map((date) => {
                return DateUtils.format(new Date(date), "MMM DD");
            });
        return labels;
    });
}
