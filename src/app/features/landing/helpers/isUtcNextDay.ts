import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export function isUtcNextDay(): boolean {
    const localToday = dayjs().startOf("day");
    const utcToday = dayjs().utc().startOf("day");
    console.log(`Local today: ${localToday.format()}, UTC today: ${utcToday.format()}`);
    return utcToday.isAfter(localToday, "day");
}
