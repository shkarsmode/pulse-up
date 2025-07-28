import { Component, inject, Input } from "@angular/core";
import { SvgIconComponent } from "angular-svg-icon";
import { TopicQRCodePopupData } from "@/app/features/landing/helpers/interfaces/topic-qrcode-popup-data.interface";
import { TopicQrcodePopupComponent } from "@/app/features/landing/ui/topic-qrcode-popup/topic-qrcode-popup.component";
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

    @Input({ required: true }) url: string;

    public onClick(): void {
        this.dialogService.open<TopicQrcodePopupComponent, TopicQRCodePopupData>(
            TopicQrcodePopupComponent,
            {
                width: "400px",
                data: {
                    link: this.url,
                    type: "topic",
                },
            },
        );
    }
}
