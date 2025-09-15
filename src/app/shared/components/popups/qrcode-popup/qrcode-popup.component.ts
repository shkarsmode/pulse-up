import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output, signal, OnDestroy } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { SafeUrl } from "@angular/platform-browser";
import { AngularSvgIconModule } from "angular-svg-icon";
import { PopupCloseButtonComponent } from "@/app/shared/components/ui-kit/popup/popup-close-button/popup-close-button.component";
import { PopupFooterComponent } from "@/app/shared/components/ui-kit/popup/popup-footer/popup-footer.component";
import { PopupSubtitleComponent } from "@/app/shared/components/ui-kit/popup/popup-subtitle/popup-subtitle.component";
import { PopupTextComponent } from "@/app/shared/components/ui-kit/popup/popup-text/popup-text.component";
import { PopupLayoutComponent } from "@/app/shared/components/ui-kit/popup/popup.component";
import { SharedModule } from "@/app/shared/modules/shared.module";
import { NotificationService } from "@/app/shared/services/core/notification.service";
import { QrcodePopupService } from "./qrcode-popup.service";
import { PrimaryButtonComponent } from "../../ui-kit/buttons/primary-button/primary-button.component";
import { TopicQRCodePopupData } from "@/app/features/landing/interfaces/topic-qrcode-popup-data.interface";

@Component({
    selector: "app-topic-qrcode-popup",
    standalone: true,
    imports: [
        AngularSvgIconModule,
        PopupLayoutComponent,
        PopupCloseButtonComponent,
        PopupSubtitleComponent,
        PopupTextComponent,
        SharedModule,
        PopupFooterComponent,
        PrimaryButtonComponent,
    ],
    templateUrl: "./qrcode-popup.component.html",
    styleUrl: "./qrcode-popup.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrcodePopupComponent implements OnDestroy {
    @Output() qrCodeURL = new EventEmitter<SafeUrl>();

    public readonly data: TopicQRCodePopupData = inject(MAT_DIALOG_DATA);
    private readonly dialogRef = inject(MatDialogRef<QrcodePopupComponent>);
    private readonly notificationService = inject(NotificationService);
    private readonly qrcodePopupService = inject(QrcodePopupService);
    
    private timeout: NodeJS.Timeout | null = null;
    public isCopied = signal(false);
    public downloadLink = this.qrcodePopupService.downloadBannerLink;

    ngOnDestroy() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }

    public async onChangeURL(url: SafeUrl) {
        this.qrCodeURL.emit(url);
        this.qrcodePopupService.generateBanner(url as string, this.data);
    }

    public onClose() {
        this.dialogRef.close();
    }

    public onCopy() {
        const blob = this.qrcodePopupService.bannerImageBlob();
        if (!blob || this.isCopied()) return;
        this.isCopied.set(true);

        try {
            navigator.clipboard.write([
                new ClipboardItem({
                    "image/png": blob,
                }),
            ]);
        } catch (error) {
            console.error(error);
            this.notificationService.error("Failed to copy image to clipboard");
        }


        this.timeout = setTimeout(() => {
            this.isCopied.set(false);
            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }
        }, 1500);
    }
}
