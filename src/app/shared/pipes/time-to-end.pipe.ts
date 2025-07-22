import { Pipe, PipeTransform } from "@angular/core";
import dayjs from "dayjs";

@Pipe({ name: "timeToEnd", standalone: true })
export class TimeToEndPipe implements PipeTransform {
    transform(value: string | Date): string {
        const now = dayjs();
        const end = dayjs(value);
        const diffInDays = end.diff(now, "day", true);

        if (diffInDays < 1 && diffInDays > 0) {
            const hoursLeft = Math.ceil(end.diff(now, "hour", true));
            return `Ends in: ${hoursLeft}h`;
        }

        const daysLeft = Math.floor(diffInDays);
        return `Ends in: ${daysLeft}d`;
    }
}
