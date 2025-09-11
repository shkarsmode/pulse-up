import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export function isUtcNextDay(date: Date): boolean {
    const localDate = dayjs(date).get("date");
    const utcDate = dayjs().utc().get("date");
    return utcDate - localDate === 1;
}
