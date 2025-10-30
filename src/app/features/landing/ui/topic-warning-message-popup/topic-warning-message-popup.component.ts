import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { PopupLayoutComponent } from "@/app/shared/components/ui-kit/popup/popup.component";
import { PopupCloseButtonComponent } from "@/app/shared/components/ui-kit/popup/popup-close-button/popup-close-button.component";
import { PopupSubtitleComponent } from "@/app/shared/components/ui-kit/popup/popup-subtitle/popup-subtitle.component";
import { PopupTextComponent } from "@/app/shared/components/ui-kit/popup/popup-text/popup-text.component";
import { PopupFooterComponent } from "@/app/shared/components/ui-kit/popup/popup-footer/popup-footer.component";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { TopicExpirationSeverity } from "@/app/shared/interfaces";

@Component({
    selector: "app-topic-warning-message-popup",
    standalone: true,
    imports: [
        PopupLayoutComponent,
        PopupCloseButtonComponent,
        PopupSubtitleComponent,
        PopupTextComponent,
        PopupFooterComponent,
        PrimaryButtonComponent,
    ],
    templateUrl: "./topic-warning-message-popup.component.html",
    styleUrl: "./topic-warning-message-popup.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicWarningMessagePopupComponent {
    private data: { severity: TopicExpirationSeverity } = inject(MAT_DIALOG_DATA);
    private dialogRef = inject(MatDialogRef<TopicWarningMessagePopupComponent>);

    public severity = this.data.severity;
    public readonly popupsContent: Record<
        TopicExpirationSeverity,
        { title: string; text: string[] }
    > = {
        warning: {
            title: "How Deactivation Works",
            text: [
                "Topics stay active for 90 days by default.",
                "If a topic receives 3 or fewer pulses per day during its active period, it enters a low-activity state.",
                "If activity doesn't increase, the topic will expire and be removed from the feed after its active period ends. Adding more pulses can keep it active longer.",
            ],
        },
        danger: {
            title: "How Archiving Works",
            text: [
                "When a topic stays inactive after expiration, it's scheduled for archiving.",
                "If it continues receiving 3 or fewer pulses per day, it will be permanently archived after 10 days of inactivity.",
                "Archived topics are no longer visible in the feed, but activity before that may still reactivate the topic if engagement rises.",
            ],
        },
    };

    public closePopup() {
        this.dialogRef.close();
    }
}
