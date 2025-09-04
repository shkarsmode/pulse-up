import { LeaderboardTimeframe } from "@/app/shared/interfaces";

export interface IGetLeaderboardLocationsRequest {
    date?: string;
    timeframe?: LeaderboardTimeframe | "last24Hours";
    "Location.Country"?: string;
    "Location.State"?: string;
    "Location.City"?: string;
}
    