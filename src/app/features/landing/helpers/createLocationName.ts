import { ILeaderboardLocation } from "../interfaces/leaderboard-filter.interface";

export const createLocationName = (location: Partial<ILeaderboardLocation>): string => {
    const parts: string[] = [];
    if (location.city) {
        parts.push(location.city);
    }
    if (location.region) {
        parts.push(location.region);
    }
    if (location.country) {
        parts.push(location.country);
    }
    return parts.join(", ");
};
