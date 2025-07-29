import { LeaderboardTimeframe } from "@/app/features/landing/interface/leaderboard-timeframe.interface";

export interface IGetLeaderboardTopicsRequest {
    count?: number;
    date?: string;
    timeframe?: LeaderboardTimeframe;
    includeTopicDetails?: boolean;
}
