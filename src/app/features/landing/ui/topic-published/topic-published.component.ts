import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { toSignal } from "@angular/core/rxjs-interop";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { map } from "rxjs";
import { CloseButtonComponent } from "@/app/shared/components/ui-kit/buttons/close-button/close-button.component";
import { CopyButtonComponent } from "@/app/shared/components/ui-kit/buttons/copy-button/copy-button.component";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { QrcodeButtonComponent } from "@/app/shared/components/ui-kit/buttons/qrcode-button/qrcode-button.component";
import { SocialsButtonComponent } from "@/app/shared/components/ui-kit/buttons/socials-button/socials-button.component";
import { MenuComponent } from "@/app/shared/components/ui-kit/menu/menu.component";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { ITopic } from "@/app/shared/interfaces";

@Component({
    selector: "app-topic-published",
    standalone: true,
    imports: [
        CommonModule,
        CloseButtonComponent,
        PrimaryButtonComponent,
        MenuComponent,
        CopyButtonComponent,
        SocialsButtonComponent,
        QrcodeButtonComponent,
    ],
    templateUrl: "./topic-published.component.html",
    styleUrl: "./topic-published.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicPublishedComponent {
    private readonly dialogRef = inject(MatDialogRef<TopicPublishedComponent>);
    private readonly pulseService = inject(PulseService);
    private readonly settingsService = inject(SettingsService);
    private readonly data: { topic: ITopic } = inject(MAT_DIALOG_DATA);

    public copied = signal(false);
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

    onCloseDialog(): void {
        this.dialogRef.close();
        this.pulseService.isJustCreatedTopic = false;
    }

    copyLink(): void {
        navigator.clipboard.writeText(this.link()).then(() => {
            this.copied.set(true);
            setTimeout(() => {
                this.copied.set(false);
            }, 1500);
        });
    }

    onCopySocialLink(event: MouseEvent) {
        event.stopPropagation();
    }
}
