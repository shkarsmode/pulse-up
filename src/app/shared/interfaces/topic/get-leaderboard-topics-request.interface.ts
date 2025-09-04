import { LeaderboardTimeframe } from "@/app/shared/interfaces";

export interface IGetLeaderboardTopicsRequest {
    count?: number;
    date?: string;
    timeframe?: LeaderboardTimeframe | "last24Hours";
    includeTopicDetails?: boolean;
    "Location.Country"?: string;
    "Location.State"?: string;
    "Location.City"?: string;
}
    