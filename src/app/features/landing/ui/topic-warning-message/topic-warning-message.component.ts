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

    public timeToArchive = signal<number>(0);
    public severity = signal<WarningMessageSeverity | null>(null);

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes["topic"] && changes["topic"].firstChange) {
            this.defineMessageType();
        }
    }

    public readonly messages: Record<WarningMessageSeverity, string> = {
        warning: "This topic will be deactivated if not enough pulses are received.",
        danger: `This topic will be archived in ${this.formatTimeLeft(this.timeToArchive())} if it doesn't get more then 3 pulses.`,
    };

    public openPopup(): void {
        const severity = this.severity();
        if (!severity) return;
        this.dialogService.open(TopicWarningMessagePopupComponent, {
            data: { severity },
        });
    }

    private defineMessageType(): void {
        const endDate = this.topic.endsAt;
        if (dayjs(endDate).isBefore(dayjs())) {
            const archivingDate = dayjs(endDate).add(10, "day");
            if (DateUtils.isWithinDaysBefore(archivingDate.toISOString(), 10)) {
                const timeToArchive = archivingDate.diff(dayjs(), "day");
                this.severity.set("danger");
                this.timeToArchive.set(timeToArchive);
            }
        }
        if (DateUtils.isWithinDaysBefore(endDate, 7)) {
            this.severity.set("warning");
        }
        // if (dayjs(endDate).isBefore(dayjs())) return;
        // if (
        //     DateUtils.isWithinDaysBefore(endDate, 1) &&
        //     (!this.topic.stats?.lastDayVotes || this.topic.stats?.lastDayVotes < 3)
        // ) {
        //     this.severity.set("danger");
        // } else if (DateUtils.isWithinDaysBefore(endDate, 7)) {
        //     this.severity.set("warning");
        // }
    }

    private formatTimeLeft(ms: number): string {
        if (!ms) return "";
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        if (days > 1) {
            return `${days} days`;
        }
        if (hours > 1) {
            return `${hours} hours ${minutes} minutes`;
        }
        return `${minutes} minutes`;
    }
}
