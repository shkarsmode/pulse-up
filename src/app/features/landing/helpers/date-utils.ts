import dayjs from "dayjs";

export class DateUtils {
    public static getStartOfWeek(date: Date): Date {
        return dayjs(date).startOf("week").toDate();
    }
    
    public static getEndOfWeek(date: Date): Date {
        return dayjs(date).endOf("week").toDate();
    }

    public static getEndOfMonth(date: Date): Date {
        return dayjs(date).endOf("month").toDate();
    }

    public static format(date: Date, format: string): string {
        return dayjs(date).format(format);
    }
}
