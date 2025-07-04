import { Component, inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { PopupLayoutComponent } from "@/app/shared/components/ui-kit/popup/popup.component";
import { PopupCloseButtonComponent } from "@/app/shared/components/ui-kit/popup/popup-close-button/popup-close-button.component";
import { PopupSubtitleComponent } from "@/app/shared/components/ui-kit/popup/popup-subtitle/popup-subtitle.component";
import { PopupTextComponent } from "@/app/shared/components/ui-kit/popup/popup-text/popup-text.component";
import { PopupFooterComponent } from "@/app/shared/components/ui-kit/popup/popup-footer/popup-footer.component";
import { SharedModule } from "@/app/shared/modules/shared.module";

interface TopicQrcodePopupData {
    link: string;
}

@Component({
    selector: "app-topic-qrcode-popup",
    standalone: true,
    imports: [
    PopupLayoutComponent,
    PopupCloseButtonComponent,
    PopupSubtitleComponent,
    PopupTextComponent,
    SharedModule,
    PopupFooterComponent
],
    templateUrl: "./topic-qrcode-popup.component.html",
    styleUrl: "./topic-qrcode-popup.component.scss",
})
export class TopicQrcodePopupComponent {
    private readonly dialogRef = inject(MatDialogRef<TopicQrcodePopupComponent>);
    readonly data: TopicQrcodePopupData = inject(MAT_DIALOG_DATA);

    onClose() {
        this.dialogRef.close();
    }
}
