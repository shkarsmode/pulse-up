export interface IPulse {
    id: number;
    icon: string;
    title: string;
    description: string;
    keywords: string[];
    createdAt: string;
    authorId: string;
    author: Author;
    startsAt: string;
    endsAt: string;
    location: Location;
    stats?: Stats;
    picture: string;
    shareKey: string;
    category: string;
}

interface Author {
    id: string;
    name: string;
    username: string;
    picture: string;
    createdAt: string;
    lastVotedAt: string;
    totalVotes: number;
}

interface Location {
    country: string;
}

interface Stats {
    totalVotes: number;
    totalUniqueUsers: number;
    lastDayVotes: number;
}
