import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { LeaderboardTimeframeExtended, LeaderboardTimeframeStatus } from "@/app/shared/interfaces";

dayjs.extend(utc);

export function getTimeframeStatus(
    selectedDate: Date,
    timeframe: LeaderboardTimeframeExtended,
): LeaderboardTimeframeStatus {
    if (timeframe === "last24Hours") return "Active";

    const timezone = selectedDate.getTimezoneOffset();
    const selectedUTC =
        timezone > 0
            ? dayjs(selectedDate).startOf("day").utc()
            : dayjs(selectedDate).endOf("day").utc();

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
