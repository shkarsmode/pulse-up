import { LeaderboardTimeframe } from "../../../shared/interfaces/topic/leaderboard-timeframe.interface";

export function getElapsedTimePercentage(
    selectedDate: Date,
    timeframe: LeaderboardTimeframe,
): number {
    const now = new Date();

    let start: Date;
    let end: Date;

    switch (timeframe) {
        case "Day":
            start = new Date(selectedDate);
            start.setHours(0, 0, 0, 0);
            end = new Date(selectedDate);
            end.setHours(23, 59, 59, 999);
            break;
        case "Week": {
            const date = new Date(selectedDate);
            const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
            const diffToStart = date.getDate() - day; // assuming week starts on Sunday
            start = new Date(date.setDate(diffToStart));
            start.setHours(0, 0, 0, 0);
            end = new Date(start);
            end.setDate(end.getDate() + 6);
            end.setHours(23, 59, 59, 999);
            break;
        }
        case "Month":
            start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
            end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
            end.setHours(23, 59, 59, 999);
            break;
        default:
            throw new Error("Unsupported timeframe");
    }

    const elapsed = now.getTime() - start.getTime();
    const total = end.getTime() - start.getTime();

    const percentage = Math.min(100, Math.max(0, (elapsed / total) * 100));
    return percentage;
}
