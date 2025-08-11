import { dateToUTC } from "./dateToUTC";

export function isTimeframeInFutureUTC(selectedDate: Date): boolean {
    const nowUtc = dateToUTC(new Date());
    return selectedDate > nowUtc;
}
