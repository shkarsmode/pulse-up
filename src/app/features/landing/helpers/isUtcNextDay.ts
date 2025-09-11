import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export function isUtcNextDay(): boolean {
    const localDate = dayjs().format("YYYY-MM-DD");
    const utcDate = dayjs().utc().format("YYYY-MM-DD");
    return utcDate > localDate;
}
