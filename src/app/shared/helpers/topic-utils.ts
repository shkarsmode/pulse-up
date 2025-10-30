import dayjs from "dayjs";
import { DateUtils } from "./date-utils";
import { ITopic, TopicExpirationSeverity } from "../interfaces";

export class TopicUtils {
    public static getExpirationSeverity(topic: ITopic): TopicExpirationSeverity | null {
        const endDate = topic.endsAt;
        if (dayjs(endDate).isBefore(dayjs())) {
            const archivingDate = dayjs(endDate).add(10, "day");
            if (
                DateUtils.isWithinDaysBefore(archivingDate.toISOString(), 10) &&
                (!topic.stats?.lastDayVotes || topic.stats?.lastDayVotes < 3)
            ) {
                return "danger";
            } else {
                return null;
            }
        } else if (
            DateUtils.isWithinDaysBefore(endDate, 7) &&
            (!topic.stats?.lastDayVotes || topic.stats?.lastDayVotes < 3)
        ) {
            return "warning";
        }
        return null;
    }
}
