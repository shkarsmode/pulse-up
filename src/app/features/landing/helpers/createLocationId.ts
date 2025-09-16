import { ILeaderboardLocation } from "../interfaces/leaderboard-filter.interface";

export const createLocationId = (location: Partial<ILeaderboardLocation>): string => {
    const parts: string[] = [];
    if (location.country) {
        parts.push(location.country);
    }
    if (location.region) {
        parts.push(location.region);
    }
    if (location.city) {
        parts.push(location.city);
    }
    return parts.join("-");
}