import { Injectable } from "@angular/core";
import { ITopic, ITopicStats } from "../../interfaces";
import { LocalStorageService, LOCAL_STORAGE_KEYS } from "../core/local-storage.service";

interface IPendingTopic {
    id: number;
    stats: ITopicStats;
}

@Injectable({
    providedIn: "root",
})
export class PendingTopicsService {
    private pendingTopics: IPendingTopic[] = [];
    private readonly STORAGE_KEY = LOCAL_STORAGE_KEYS.pendingTopics;

    constructor() {
        this.loadFromStorage();
    }

    get(id: number): IPendingTopic | null {
        const topic = this.pendingTopics.find(topic => topic.id === id);
        if (!topic) return null;
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
        };
        
        this.pendingTopics = this.pendingTopics.filter((pendingTopic) => {
            return pendingTopic.id !== topic.id
        });
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
        this.pendingTopics = stored ?? [];
    }
}
