import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    inject,
    Output,
    signal,
} from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { SafeUrl } from "@angular/platform-browser";
import { AngularSvgIconModule } from "angular-svg-icon";
import { DomSanitizer } from "@angular/platform-browser";
import { PopupCloseButtonComponent } from "@/app/shared/components/ui-kit/popup/popup-close-button/popup-close-button.component";
import { PopupFooterComponent } from "@/app/shared/components/ui-kit/popup/popup-footer/popup-footer.component";
import { PopupSubtitleComponent } from "@/app/shared/components/ui-kit/popup/popup-subtitle/popup-subtitle.component";
import { PopupTextComponent } from "@/app/shared/components/ui-kit/popup/popup-text/popup-text.component";
import { PopupLayoutComponent } from "@/app/shared/components/ui-kit/popup/popup.component";
import { SharedModule } from "@/app/shared/modules/shared.module";
import { TopicQRCodePopupData } from "../../../../features/landing/interfaces/topic-qrcode-popup-data.interface";
import { PrimaryButtonComponent } from "../../ui-kit/buttons/primary-button/primary-button.component";
import { QRCodeBannerGenerator } from "@/app/shared/helpers/qrcode-banner-generator";
import { RippleEffectDirective } from "@/app/shared/directives/ripple-effect";
import { NotificationService } from "@/app/shared/services/core/notification.service";

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
        RippleEffectDirective,
    ],
    providers: [QRCodeBannerGenerator],
    templateUrl: "./qrcode-popup.component.html",
    styleUrl: "./qrcode-popup.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrcodePopupComponent {
    @Output() qrCodeURL = new EventEmitter<SafeUrl>();

    private readonly sanitizer = inject(DomSanitizer);
    private readonly qrCodeBannerGenerator = inject(QRCodeBannerGenerator);
    private readonly dialogRef = inject(MatDialogRef<QrcodePopupComponent>);
    private readonly notificationService = inject(NotificationService);
    public readonly data: TopicQRCodePopupData = inject(MAT_DIALOG_DATA);

    private imageBlob: Blob | null = null;

    public qrCodeDownloadLink = signal<SafeUrl>("");

    public onClose() {
        this.dialogRef.close();
    }

    public async onChangeURL(url: SafeUrl) {
        this.qrCodeURL.emit(url);
        const objectUrl = this.sanitizer.sanitize(4, url);
        if (!objectUrl) return;
        const finalUrl = await this.qrCodeBannerGenerator.generateBanner({
            qrImageUrl: objectUrl,
            title: this.data.banner.title,
            description: this.data.banner.subtitle,
            qrSize: 1600,
        });
        this.qrCodeDownloadLink.set(this.sanitizer.bypassSecurityTrustUrl(finalUrl));
        this.imageBlob = this.dataURLToBlob(finalUrl);
    }

    public onCopy() {
        if (!this.imageBlob) return;
        try {
            navigator.clipboard.write([
                new ClipboardItem({
                    "image/png": this.imageBlob,
                }),
            ]);
        } catch (error) {
            console.error(error);
            this.notificationService.error("Failed to copy image to clipboard");
        }
    }

    private dataURLToBlob(dataURL: string): Blob {
        const [header, base64] = dataURL.split(",");
        const mime = header.match(/:(.*?);/)![1];
        const byteString = atob(base64);
        const array = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
            array[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([array], { type: mime });
        return blob;
    }
}
