import { computed, Injectable, signal } from "@angular/core";
import { ITopic, ITopicStats, TopicStatsUnit, TopicVotingHistory } from "../../interfaces";
import { LocalStorageService, LOCAL_STORAGE_KEYS } from "../core/local-storage.service";
import { DateUtils } from "../../helpers/date-utils";

interface IPendingTopic {
    id: number;
    stats: ITopicStats;
    votingHistory?: Record<TopicStatsUnit, TopicVotingHistory>;
}

@Injectable({
    providedIn: "root",
})
export class PendingTopicsService {
    private readonly STORAGE_KEY = LOCAL_STORAGE_KEYS.pendingTopics;
    private pendingTopics = signal<IPendingTopic[]>([]);

    public pendingTopicsIds = computed(() => this.pendingTopics().map((topic) => topic.id));

    constructor() {
        this.loadFromStorage();
    }

    get(id: number): IPendingTopic | null {
        const topic = this.pendingTopics().find((topic) => topic.id === id);
        if (!topic) return null;
        return topic;
    }

    add(topic: ITopic): void {
        const hour = DateUtils.getUTCStartOfCurrentHour().format("YYYY-MM-DDTHH:mm:ss[Z]");
        const day = DateUtils.getUTCStartOfCurrentDay().format("YYYY-MM-DDTHH:mm:ss[Z]");
        const newPendingTopic: IPendingTopic = {
            id: topic.id,
            stats: topic.stats
                ? {
                      totalVotes: (topic.stats?.totalVotes || 0) + 1,
                      lastDayVotes: (topic.stats?.lastDayVotes || 0) + 1,
                      totalUniqueUsers: topic.stats?.totalUniqueUsers || 0,
                  }
                : {
                      totalVotes: 0,
                      totalUniqueUsers: 0,
                      lastDayVotes: 0,
                  },
            votingHistory: {
                hourly: {
                    [hour]: 1,
                },
                daily: {
                    [day]: 1,
                },
            },
        };
        const topics = this.pendingTopics();

        this.pendingTopics.set([
            ...topics.filter((pendingTopic) => pendingTopic.id !== topic.id),
            newPendingTopic,
        ]);
        this.saveToStorage();
    }

    remove(topicId: number): void {
        this.pendingTopics.set(this.pendingTopics().filter((topic) => topic.id !== topicId));
        this.saveToStorage();
    }

    clear(): void {
        this.pendingTopics.set([]);
        LocalStorageService.remove(this.STORAGE_KEY);
    }

    private saveToStorage(): void {
        LocalStorageService.set<IPendingTopic[]>(this.STORAGE_KEY, this.pendingTopics());
    }

    private loadFromStorage(): void {
        const stored = LocalStorageService.get<IPendingTopic[]>(this.STORAGE_KEY);
        this.pendingTopics.set(stored || []);
    }
}
