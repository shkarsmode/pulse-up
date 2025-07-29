import { IAuthor } from "./author.interface";

export interface ITopic {
    id: number;
    icon: string;
    title: string;
    description: string;
    keywords: string[];
    createdAt: string;
    authorId: string;
    author: IAuthor;
    startsAt: string;
    endsAt: string;
    location: Location;
    stats?: ITopicStats;
    picture: string;
    shareKey: string;
    category: string;
    state: TopicState;
    campaign?: Campaign;
}

export interface ILeaderboardTopic
    extends Pick<
        ITopic,
        "id" | "icon" | "title" | "shareKey" | "authorId" | "author" | "startsAt" | "endsAt"
    > {}

export enum TopicState {
    Active = "Active",
    Archived = "Archived",
    Blocked = "Blocked",
}

interface Location {
    country: string;
}

export interface ITopicStats {
    totalVotes: number;
    totalUniqueUsers: number;
    lastDayVotes: number;
}

interface CampaignGoal {
    reward: string;
    supporters?: number;
    lifetimeVotes?: number;
    dailyVotes?: number;
}

export interface Campaign {
    id: string;
    createdAt: string; // ISO timestamp
    description: string;
    endsAt: string; // ISO timestamp
    goals: CampaignGoal[];
    accomplishedGoals: string[]; // ISO timestamps
    sponsorLink: string;
    sponsorLogo: string;
    sponsoredBy: string;
    startsAt: string; // ISO timestamp
}
