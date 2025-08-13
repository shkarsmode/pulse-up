import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import weekday from "dayjs/plugin/weekday";
import utc from 'dayjs/plugin/utc';
import { LeaderboardTimeframe } from "../interface/leaderboard-timeframe.interface";
import { dateToUTC } from "./dateToUTC";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(weekday);
dayjs.extend(utc);

export function isCurrentTimeframeActive(selectedDate: Date, timeframe: LeaderboardTimeframe): boolean {
    const today = dayjs(dateToUTC(new Date()));
    const selected = dayjs(selectedDate);

    switch (timeframe) {
        case "Day":
            return selected.isSame(today, "day");

        case "Week": {
            // Sunday as first day of week (standard for US calendar)
            const startOfWeek = today.startOf("week"); // Sunday
            const endOfWeek = today.endOf("week"); // Saturday
            return (
                selected.isSameOrAfter(startOfWeek, "day") &&
                selected.isSameOrBefore(endOfWeek, "day")
            );
        }

        case "Month": {
            return selected.isSame(today, "month");
        }

        default:
            return false;
    }
}
