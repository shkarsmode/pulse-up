import { LeaderboardTimeframe } from "@/app/shared/interfaces/topic/leaderboard-timeframe.interface";

export interface IGetLeaderboardTopicsRequest {
    count?: number;
    date?: string;
    timeframe?: LeaderboardTimeframe | "last24Hours";
    includeTopicDetails?: boolean;
}
