import { Injectable } from "@angular/core";
import { ITopic, ITopicStats } from "../../interfaces";

interface IPendingTopic {
    id: number;
    stats: ITopicStats;
    expiresAt: string;
}

@Injectable({
    providedIn: "root",
})
export class PendingTopicsService {
    private pendingTopics: IPendingTopic[] = [];
    private expirationTime = 2 * 60 * 1000; // 2 minutes

    get(id: number): IPendingTopic | null {
        const topic = this.pendingTopics.find(topic => topic.id === id);
        if (!topic) return null;
        const isExpired = new Date(topic.expiresAt) < new Date();
        if (isExpired) {
            this.remove(id);
            return null;
        }
        return topic;
    }

    add(topic: ITopic): void {
        this.pendingTopics.push({
            id: topic.id,
            stats: topic.stats || {
                totalVotes: 0,
                totalUniqueUsers: 0,
                lastDayVotes: 0
            },
            expiresAt: new Date(Date.now() + this.expirationTime).toISOString()
        });
    }

    remove(topicId: number): void {
        this.pendingTopics = this.pendingTopics.filter(topic => topic.id !== topicId);
    }

    clear(): void {
        this.pendingTopics = [];
    }
}