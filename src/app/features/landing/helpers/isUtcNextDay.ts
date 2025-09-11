import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export function isUtcNextDay(): boolean {
    const localDate = dayjs().get("date");
    const utcDate = dayjs().utc().get("date");
    console.log({ localDay: localDate, utcDay: utcDate });

    return utcDate - localDate === 1;
}
