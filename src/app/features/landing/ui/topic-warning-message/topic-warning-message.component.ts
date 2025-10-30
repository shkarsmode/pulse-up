import {
    ChangeDetectionStrategy,
    Component,
    Input,
    signal,
    inject,
    OnChanges,
    SimpleChanges,
} from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";
import dayjs from "dayjs";
import { ITopic } from "@/app/shared/interfaces";
import { DateUtils } from "@/app/shared/helpers/date-utils";
import { DialogService } from "@/app/shared/services/core/dialog.service";
import { LinkButtonComponent } from "@/app/shared/components/ui-kit/buttons/link-button/link-button.component";
import { TopicWarningMessagePopupComponent } from "../topic-warning-message-popup/topic-warning-message-popup.component";
import { WarningMessageSeverity } from "../../interfaces/warning-message-severity.interface";

@Component({
    selector: "app-topic-warning-message",
    standalone: true,
    imports: [AngularSvgIconModule, LinkButtonComponent],
    templateUrl: "./topic-warning-message.component.html",
    styleUrl: "./topic-warning-message.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicWarningMessageComponent implements OnChanges {
    @Input() topic: ITopic;

    private dialogService = inject(DialogService);

    public isVisible = signal<boolean>(false);
    public timeToArchive = signal<number>(0);
    public message = signal<string>("");
    public severity = signal<WarningMessageSeverity | null>(null);

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes["topic"]) {
            this.isVisible.set(false);
            this.timeToArchive.set(0);
            this.severity.set(null);
            this.updateMessage(changes["topic"].currentValue);
        }
    }

    public openPopup(): void {
        const severity = this.severity();
        if (!severity) return;
        this.dialogService.open(TopicWarningMessagePopupComponent, {
            data: { severity },
        });
    }

    private updateMessage(topic: ITopic): void {
        const endDate = topic.endsAt;
        if (dayjs(endDate).isBefore(dayjs())) {
            const archivingDate = dayjs(endDate).add(10, "day");
            if (
                DateUtils.isWithinDaysBefore(archivingDate.toISOString(), 10) &&
                (!this.topic.stats?.lastDayVotes || this.topic.stats?.lastDayVotes < 3)
            ) {
                const timeToArchive = archivingDate.diff(dayjs());
                this.severity.set("danger");
                this.timeToArchive.set(timeToArchive);
                this.message.set(`This topic will be archived in ${this.formatTimeLeft(this.timeToArchive())} if it doesn't get more then 3 pulses.`);
                this.isVisible.set(true);
            } else {
                this.isVisible.set(false);
            }
        } else if (
            DateUtils.isWithinDaysBefore(endDate, 7) &&
            (!this.topic.stats?.lastDayVotes || this.topic.stats?.lastDayVotes < 3)
        ) {
            this.severity.set("warning");
            this.message.set("This topic will be deactivated if not enough pulses are received.");
            this.isVisible.set(true);
        }
    }

    private formatTimeLeft(ms: number): string {
        console.log({ ms });

        if (!ms) return "";
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        if (days > 1) {
            return `${days} days`;
        }
        if (hours > 1) {
            return `${hours} hours`;
        }
        return `${minutes} minutes`;
    }
}
