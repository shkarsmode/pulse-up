function getUTCOffsetHours(): number {
    return new Date().getTimezoneOffset() / 60;
}
export function dateToUTC(date: Date): Date {
    const utcOffset = getUTCOffsetHours();
    return new Date(date.getTime() + utcOffset * 60 * 60 * 1000);
}
