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
import { ITopic, TopicExpirationSeverity } from "@/app/shared/interfaces";
import { DialogService } from "@/app/shared/services/core/dialog.service";
import { LinkButtonComponent } from "@/app/shared/components/ui-kit/buttons/link-button/link-button.component";
import { TopicWarningMessagePopupComponent } from "../topic-warning-message-popup/topic-warning-message-popup.component";
import { TopicUtils } from "@/app/shared/helpers/topic-utils";

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
    public severity = signal<TopicExpirationSeverity | null>(null);

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
        const severity = TopicUtils.getExpirationSeverity(topic);

        switch (severity) {
            case "danger": {
                const endDate = topic.endsAt;
                const archivingDate = dayjs(endDate).add(10, "day");
                const timeToArchive = archivingDate.diff(dayjs());
                this.severity.set("danger");
                this.timeToArchive.set(timeToArchive);
                this.message.set(
                    `This topic will be archived in ${this.formatTimeLeft(this.timeToArchive())} if it doesn't get more then 3 pulses.`,
                );
                this.isVisible.set(true);
                break;
            }
            case "warning": {
                this.severity.set("warning");
                this.message.set(
                    "This topic will be deactivated if not enough pulses are received.",
                );
                this.isVisible.set(true);
                break;
            }
            default:
                this.isVisible.set(false);
        }
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
            return `${hours} hours`;
        }
        return `${minutes} minutes`;
    }
}
