import { LeaderboardTimeframe } from "./leaderboard-timeframe.interface";
import { ITopic } from "../pulse.interface";

export interface ILeaderboardTopicData {
    topic: ITopic;
    votes: number;
    uniqueUsers: number;
    lastVoteTime: string;
}

export interface IGetLeaderboardTopicsResponse {
    date: string;
    timeframe: LeaderboardTimeframe | "last24Hours";
    results: ILeaderboardTopicData[];
}
