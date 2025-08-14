import { LeaderboardTimeframe } from "../interface/leaderboard-timeframe.interface";

const formatDayTime = (ms: number): string => {
    const minutesTotal = Math.floor(ms / (1000 * 60));
    const hours = Math.floor((minutesTotal % (60 * 24)) / 60);
    const minutes = minutesTotal % 60;
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    const parts: string[] = [];
    if (hours) parts.push(`${hours}h`);
    parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return parts.length > 0 ? parts.join(" ") : "0h 0m 0s";
};

const formatWeekTime = (ms: number): string => {
    const minutesTotal = Math.floor(ms / (1000 * 60));
    const days = Math.floor(minutesTotal / (60 * 24));
    const hours = Math.floor((minutesTotal % (60 * 24)) / 60);
    const minutes = minutesTotal % 60;
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    const parts: string[] = [];
    if (days) parts.push(`${days} day${days > 1 ? "s" : ""}`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    if (!days) parts.push(`${seconds}s`); // Show seconds only if less than a day

    return parts.length > 0 ? parts.join(" ") : "0h 0m 0s";
};

const formatMonthTime = (ms: number): string => {
    const minutesTotal = Math.floor(ms / (1000 * 60));
    const days = Math.floor(minutesTotal / (60 * 24));
    const hours = Math.floor((minutesTotal % (60 * 24)) / 60);
    const minutes = minutesTotal % 60;
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    const parts: string[] = [];

    if (days) parts.push(`${days} day${days > 1 ? "s" : ""}`);

    // Show hours and minutes only if less than a day
    if (days === 0) {
        if (hours) parts.push(`${hours}h`);
        if (minutes) parts.push(`${minutes}m`);
        if (hours === 0 && minutes === 0 && seconds) parts.push(`${seconds}s`);
    }

    return parts.length > 0 ? parts.join(" ") : "0h 0m 0s";
};

const timeFormatters: Record<LeaderboardTimeframe, (ms: number) => string> = {
    Day: formatDayTime,
    Week: formatWeekTime,
    Month: formatMonthTime,
};

export const formatRemainingTime = (
    ms: number,
    selectedTimeframe: LeaderboardTimeframe,
): string => {
    const formatter = timeFormatters[selectedTimeframe];
    return formatter(ms);
};
