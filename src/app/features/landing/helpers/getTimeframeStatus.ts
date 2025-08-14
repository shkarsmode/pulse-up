import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { LeaderboardTimeframe } from "../interface/leaderboard-timeframe.interface";
import { LeaderboardTimeframeStatus } from "../interface/leaderboard-timeframe-status.interface";

dayjs.extend(utc);


export function getTimeframeStatus(selectedDate: Date, timeframe: LeaderboardTimeframe): LeaderboardTimeframeStatus {
    const selectedUTC = dayjs(selectedDate).utc();

    let startUTC: dayjs.Dayjs;
    let endUTC: dayjs.Dayjs;

    switch (timeframe) {
        case "Day":
            startUTC = selectedUTC.startOf("day");
            endUTC = selectedUTC.endOf("day");
            break;

        case "Week":
            startUTC = selectedUTC.startOf("week");
            endUTC = selectedUTC.endOf("week");
            break;

        case "Month":
            startUTC = selectedUTC.startOf("month");
            endUTC = selectedUTC.endOf("month");
            break;

        default:
            throw new Error(`Unsupported timeframe: ${timeframe}`);
    }

    const nowUTC = dayjs().utc();

    if (nowUTC.isBefore(startUTC)) {
        return "Upcoming";
    } else if (nowUTC.isAfter(endUTC)) {
        return "Ended";
    } else {
        return "Active";
    }
}
