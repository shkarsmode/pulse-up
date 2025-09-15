import { Component, inject, Input } from "@angular/core";
import { SvgIconComponent } from "angular-svg-icon";
import { TopicQRCodePopupData } from "@/app/features/landing/interfaces/topic-qrcode-popup-data.interface";
import { QrcodePopupComponent } from "@/app/shared/components/popups/qrcode-popup/qrcode-popup.component";
import { DialogService } from "@/app/shared/services/core/dialog.service";

@Component({
    selector: "app-qrcode-button",
    standalone: true,
    imports: [SvgIconComponent],
    templateUrl: "./qrcode-button.component.html",
    styleUrl: "./qrcode-button.component.scss",
})
export class QrcodeButtonComponent {
    private readonly dialogService = inject(DialogService);

    @Input() link: string;
    @Input() popupTitle: string;
    @Input() popupSubtitle: string;
    @Input() bannerIcon: string;
    @Input() bannerTitle: string;
    @Input() bannerSubtitle: string;

    public onClick(): void {
        this.dialogService.open<QrcodePopupComponent, TopicQRCodePopupData>(QrcodePopupComponent, {
            width: "630px",
            data: {
                link: this.link,
                popup: {
                    title: this.popupTitle,
                    subtitle: this.popupSubtitle,
                },
                banner: {
                    icon: this.bannerIcon,
                    title: this.bannerTitle,
                    subtitle: this.bannerSubtitle,
                },
            },
        });
    }
}
