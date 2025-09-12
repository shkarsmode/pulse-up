import { PopupCloseButtonComponent } from "@/app/shared/components/ui-kit/popup/popup-close-button/popup-close-button.component";
import { PopupFooterComponent } from "@/app/shared/components/ui-kit/popup/popup-footer/popup-footer.component";
import { PopupSubtitleComponent } from "@/app/shared/components/ui-kit/popup/popup-subtitle/popup-subtitle.component";
import { PopupTextComponent } from "@/app/shared/components/ui-kit/popup/popup-text/popup-text.component";
import { PopupLayoutComponent } from "@/app/shared/components/ui-kit/popup/popup.component";
import { SharedModule } from "@/app/shared/modules/shared.module";
import { Component, inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { TopicQRCodePopupData } from "../../interfaces/topic-qrcode-popup-data.interface";

@Component({
    selector: "app-topic-qrcode-popup",
    standalone: true,
    imports: [
        PopupLayoutComponent,
        PopupCloseButtonComponent,
        PopupSubtitleComponent,
        PopupTextComponent,
        SharedModule,
        PopupFooterComponent,
    ],
    templateUrl: "./topic-qrcode-popup.component.html",
    styleUrl: "./topic-qrcode-popup.component.scss",
})
export class TopicQrcodePopupComponent {
    private readonly dialogRef = inject(MatDialogRef<TopicQrcodePopupComponent>);
    private readonly data: TopicQRCodePopupData = inject(MAT_DIALOG_DATA);

    public title = this.data.title;
    public subtitle = this.data.subtitle;
    public link = this.data.link;

    public onClose() {
        this.dialogRef.close();
    }
}
