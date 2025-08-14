import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { LeaderboardTimeframe } from "../interface/leaderboard-timeframe.interface";

dayjs.extend(utc);

export const getRemainingTimeToEnd = (
    selectedDate: Date,
    selectedTimeframe: LeaderboardTimeframe,
) => {
    const nowUTC = dayjs().utc();
    const selectedUTC = dayjs(selectedDate).utc();

    let endUTC: dayjs.Dayjs;

    switch (selectedTimeframe) {
        case "Day":
            endUTC = selectedUTC.endOf("day");
            break;

        case "Week":
            // Sunday-based week
            endUTC = selectedUTC.endOf("week");
            break;

        case "Month":
            endUTC = selectedUTC.endOf("month");
            break;

        default:
            throw new Error("Invalid timeframe");
    }

    // console.log({selectedTimeframe, endUTC});
    
    if (endUTC.isBefore(nowUTC)) {
        return 0;
    }

    return endUTC.diff(nowUTC); // milliseconds
};
