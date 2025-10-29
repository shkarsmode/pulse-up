import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export class DateUtils {
    public static getStatrtOfDay(date: Date): Date {
        return dayjs(date).startOf("day").toDate();
    }

    public static getEndOfDay(date: Date): Date {
        return dayjs(date).endOf("day").toDate();
    }

    public static getStartOfWeek(date: Date): Date {
        return dayjs(date).startOf("week").toDate();
    }

    public static getEndOfWeek(date: Date): Date {
        return dayjs(date).endOf("week").toDate();
    }

    public static getEndOfMonth(date: Date): Date {
        return dayjs(date).endOf("month").toDate();
    }

    public static getStartOfMonth(date: Date): Date {
        return dayjs(date).startOf("month").toDate();
    }

    public static format(date: Date, format: string): string {
        return dayjs(date).format(format);
    }

    public static toISOString(date: Date): string {
        return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
    }

    public static getUTCStartOfCurrentHour = () => {
        return dayjs().utc().startOf("hour");
    };

    public static getUTCStartOfCurrentDay = () => {
        return dayjs().utc().startOf("day");
    };
}
