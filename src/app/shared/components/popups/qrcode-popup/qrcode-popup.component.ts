import {
    ChangeDetectionStrategy,
    Component,
    inject,
    signal,
    OnDestroy,
    OnInit,
    DestroyRef,
} from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { AngularSvgIconModule } from "angular-svg-icon";
import { tap } from "rxjs";
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
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { SpinnerComponent } from "../../ui-kit/spinner/spinner.component";

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
        SpinnerComponent,
    ],
    templateUrl: "./qrcode-popup.component.html",
    styleUrl: "./qrcode-popup.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrcodePopupComponent implements OnDestroy, OnInit {
    private readonly sanitizer = inject(DomSanitizer);
    private readonly destroyRef = inject(DestroyRef);
    private readonly dialogRef = inject(MatDialogRef<QrcodePopupComponent>);
    private readonly notificationService = inject(NotificationService);
    private readonly qrcodePopupService = inject(QrcodePopupService);
    public readonly data: TopicQRCodePopupData = inject(MAT_DIALOG_DATA);

    private timeout: NodeJS.Timeout | null = null;
    private qrCodeUrl = signal<string | null>(null);
    private qrCodeUrl$ = toObservable(this.qrCodeUrl);
    public isCopied = signal(false);
    public isFailed = signal(false);
    public isLoading = signal(true);
    public bannerLink = signal<SafeUrl | null>(null);
    public bannerImage = signal<Blob | null>(null);

    ngOnInit() {
        this.qrCodeUrl$.pipe(
                tap(async (qrCodeUrl) => {
                    if (!qrCodeUrl || this.bannerLink()) return;
                    const { icon, title, subtitle } = this.data.banner;
                    const bannerLink = await this.qrcodePopupService.generateBannerLink({
                        qrCodeUrl,
                        iconUrl: icon,
                        title,
                        subtitle,
                    });
                    if (!bannerLink) {
                        this.isFailed.set(true);
                        this.isLoading.set(false);
                        this.notificationService.error(
                            "Failed to generate QR code banner. Please reload the page and try again.",
                        );
                        return;
                    }
                    const objectUrl = this.sanitizer.sanitize(4, bannerLink);
                    if (objectUrl) {
                        const bannerBlob = this.qrcodePopupService.dataURLToBlob(objectUrl);
                        this.bannerImage.set(bannerBlob);
                    }
                    this.bannerLink.set(bannerLink);
                    this.isLoading.set(false);
                    this.isFailed.set(false);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    ngOnDestroy() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }

    public async onChangeURL(url: SafeUrl) {
        const objectUrl = this.sanitizer.sanitize(4, url);
        if (!objectUrl) {
            this.isFailed.set(true);
            this.isLoading.set(false);
            this.notificationService.error(
                "Failed to generate QR code banner. Please reload the page and try again.",
            );
            return;
        }
        this.qrCodeUrl.set(objectUrl);
    }

    public onClose() {
        this.dialogRef.close();
    }

    public onCopy() {
        const blob = this.bannerImage();
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
