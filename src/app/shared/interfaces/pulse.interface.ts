import { IAuthor } from "./author.interface";

export interface IPulse {
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
}

interface Location {
    country: string;
}

interface Stats {
    totalVotes: number;
    totalUniqueUsers: number;
    lastDayVotes: number;
}
