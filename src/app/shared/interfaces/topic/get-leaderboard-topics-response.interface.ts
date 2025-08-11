import { LeaderboardTimeframe } from "@/app/features/landing/interface/leaderboard-timeframe.interface";
import { ITopic } from "../pulse.interface";

export interface IGetLeaderboardTopicsResponse {
    date: string;
    timeframe: LeaderboardTimeframe;
    results: {
        topic: ITopic;
        votes: number;
        uniqueUsers: number;
        lastVoteTime: string;
    }[];
}
