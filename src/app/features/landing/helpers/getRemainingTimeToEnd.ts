import { LeaderboardTimeframe } from "../interface/leaderboard-timeframe.interface";
import { dateToUTC } from "./dateToUTC";

export const getRemainingTimeToEnd = (
    selectedDate: Date,
    selectedTimeframe: LeaderboardTimeframe,
) => {
    const now = dateToUTC(new Date());
    const start = new Date(selectedDate);

    let end: Date;

    switch (selectedTimeframe) {
        case "Day":
            end = new Date(start);
            end.setHours(23, 59, 59, 999);
            break;
        case "Week": {
            // Sunday-based week, get Sunday after selectedDate
            const dayOfWeek = start.getDay(); // 0 = Sunday ... 6 = Saturday
            const diffToSunday = 7 - dayOfWeek; // days to next Sunday
            end = new Date(start);
            end.setDate(start.getDate() + diffToSunday);
            end.setHours(23, 59, 59, 999);
            break;
        }
        case "Month":
            end = new Date(start.getFullYear(), start.getMonth() + 1, 0); // last day of month
            end.setHours(23, 59, 59, 999);
            break;
        default:
            throw new Error("Invalid timeframe");
    }

    if (end.getTime() < now.getTime()) {
        return 0;
    }

    const diffMs = end.getTime() - now.getTime();

    return diffMs;
};
