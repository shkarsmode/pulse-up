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
    stats?: Stats;
    picture: string;
    shareKey: string;
    category: string;
    state: TopicState;
}

export enum TopicState {
    Active = "Active",
    Archived = "Archived",
    Blocked = "Blocked",
};

interface Location {
    country: string;
}

interface Stats {
    totalVotes: number;
    totalUniqueUsers: number;
    lastDayVotes: number;
}
