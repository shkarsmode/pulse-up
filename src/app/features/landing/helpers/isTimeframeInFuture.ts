import { dateToUTC } from "./dateToUTC";

export function isTimeframeInFuture(selectedDate: Date): boolean {
    const nowUtc = dateToUTC(new Date());
    return selectedDate > nowUtc;
}
