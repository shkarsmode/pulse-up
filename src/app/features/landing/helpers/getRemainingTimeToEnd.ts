import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { LeaderboardTimeframe } from "@/app/shared/interfaces";

dayjs.extend(utc);

export const getRemainingTimeToEnd = (
    selectedDate: Date,
    selectedTimeframe: LeaderboardTimeframe,
) => {
    const nowUTC = dayjs().utc();
    const timezone = selectedDate.getTimezoneOffset();
    const selectedUTC =
        timezone > 0
            ? dayjs(selectedDate).startOf("day").utc()
            : dayjs(selectedDate).endOf("day").utc();

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

    if (endUTC.isBefore(nowUTC)) {
        return 0;
    }

    return endUTC.diff(nowUTC); // milliseconds
};
