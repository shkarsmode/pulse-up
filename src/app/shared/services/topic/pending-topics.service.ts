import { Injectable } from "@angular/core";
import { ITopic, ITopicStats } from "../../interfaces";
import { LocalStorageService, LOCAL_STORAGE_KEYS } from "../core/local-storage.service";

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
    private readonly STORAGE_KEY = 'pending_topics';

    constructor() {
        this.loadFromStorage();
    }

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
        const newPendingTopic: IPendingTopic = {
            id: topic.id,
            stats: topic.stats || {
                totalVotes: 0,
                totalUniqueUsers: 0,
                lastDayVotes: 0,
            },
            expiresAt: new Date(Date.now() + this.expirationTime).toISOString()
        };

        this.pendingTopics = this.pendingTopics.filter(t => t.id !== topic.id);
        this.pendingTopics.push(newPendingTopic);

        this.saveToStorage();
    }

    remove(topicId: number): void {
        this.pendingTopics = this.pendingTopics.filter(topic => topic.id !== topicId);
        this.saveToStorage();
    }

    clear(): void {
        this.pendingTopics = [];
        LocalStorageService.remove(this.STORAGE_KEY);
    }

    private saveToStorage(): void {
        LocalStorageService.set<IPendingTopic[]>(this.STORAGE_KEY, this.pendingTopics);
    }

    private loadFromStorage(): void {
        const stored = LocalStorageService.get<IPendingTopic[]>(this.STORAGE_KEY);
        const now = new Date();
        this.pendingTopics = (stored ?? []).filter(topic => new Date(topic.expiresAt) > now);
        this.saveToStorage();
    }
}
