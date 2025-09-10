import { LeaderboardTimeframeExtended } from "@/app/shared/interfaces";

export interface ILeaderboardLocation {
    country: string | null;
    region: string | null;
    city: string | null;
}

export interface ILeaderboardTempFilter {
    date: Date | null;
    timeframe: LeaderboardTimeframeExtended;
    location: ILeaderboardLocationOption;
}

export interface ILeaderboardFilter {
    date: Date;
    timeframe: LeaderboardTimeframeExtended;
    location?: Partial<ILeaderboardLocation>;
}

export interface ILeaderboardLocationOption {
    id: string;
    label: string;
    data: ILeaderboardLocation;
}