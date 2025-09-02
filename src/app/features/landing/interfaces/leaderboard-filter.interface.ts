import { LeaderboardTimeframeExtended } from "@/app/shared/interfaces";

export interface ILeaderboardFilterLocation {
    country: string | null;
    region: string | null;
    city: string | null;
}

export interface ILeaderboardTempFilter {
    date: Date | null;
    timeframe: LeaderboardTimeframeExtended;
    location: ILeaderboardFilterLocation;
}

export interface ILeaderboardFilter {
    date: Date;
    timeframe: LeaderboardTimeframeExtended;
    location?: Partial<ILeaderboardFilterLocation>;
}

type ILeaderboardLocationType = "global" | "country" | "region" | "city";

export interface ILeaderboardLocationOption {
    label: string;
    value: ILeaderboardLocationType;
}