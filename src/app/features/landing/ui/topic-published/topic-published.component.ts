import { CloseButtonComponent } from "@/app/shared/components/ui-kit/buttons/close-button/close-button.component";
import { ITopic } from "@/app/shared/interfaces";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { NotificationService } from "@/app/shared/services/core/notification.service";
import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { map } from "rxjs";

@Component({
    selector: "app-topic-published",
    standalone: true,
    imports: [
        CommonModule,
        CloseButtonComponent,
    ],
    templateUrl: "./topic-published.component.html",
    styleUrl: "./topic-published.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicPublishedComponent {
    private readonly dialogRef = inject(MatDialogRef<TopicPublishedComponent>);
    private readonly pulseService = inject(PulseService);
    private readonly settingsService = inject(SettingsService);
    private readonly notificationService = inject(NotificationService);
    private readonly data: { topic: ITopic } = inject(MAT_DIALOG_DATA);

    public link = toSignal(
        this.settingsService.settings$.pipe(
            map((settings) => settings.shareTopicBaseUrl + this.data.topic.shareKey),
        ),
        { initialValue: "" },
    );
    public get qrCodePopupText(): string {
        return `Share the '${this.data.topic.title}' topic with this QR code.`;
    }
    public get qrCodeBannerTitle(): string {
        return this.data.topic.title;
    }
    public get qrCodeBannerSubtitle(): string {
        return this.data.topic.description;
    }
    public qrCodeBannerIcon = toSignal(this.settingsService.settings$.pipe(
        map((settings) => settings.blobUrlPrefix + this.data.topic.icon),
    ), { initialValue: "" });

    onCloseDialog(): void {
        this.dialogRef.close();
        this.pulseService.isJustCreatedTopic = false;
    }

    copyLink(): void {
        navigator.clipboard.writeText(this.link()).then(() => {
            this.notificationService.success("Link copied to clipboard!");
        });
    }

    shareVia(url: string): void {
        const shareData = {
            title: this.data.topic.title,
            text: `Check out "${this.data.topic.title}" on GoPulse!`,
            url,
        };

        if (navigator.share) {
            navigator.share(shareData).catch(() => {
                this.notificationService.error("Sharing failed. Please try again.");
            });
            return;
        }

        this.notificationService.info("Native sharing not available. Link copied instead.");
        this.copyLink();
    }

    shareOnTwitter(url: string): void {
        const text = encodeURIComponent(`Check out "${this.data.topic.title}" on GoPulse!`);
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${text}`, '_blank');
    }

    shareOnFacebook(url: string): void {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    }
}
