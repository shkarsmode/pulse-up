import { Pipe, PipeTransform } from "@angular/core";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

@Pipe({ name: "timeFromNow", standalone: true })
export class TimeFromNowPipe implements PipeTransform {
    transform(value: string | Date): string {
        return dayjs(value).fromNow();
    }
}
