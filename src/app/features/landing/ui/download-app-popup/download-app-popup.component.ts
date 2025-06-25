import { Component, inject } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { GetAppButtonComponent } from "@/app/shared/components/ui-kit/buttons/get-app-button/get-app-button.component";
import { PopupLayoutComponent } from "@/app/shared/components/ui-kit/popup/popup.component";
import { PopupCloseButtonComponent } from "@/app/shared/components/ui-kit/popup/popup-close-button/popup-close-button.component";
import { PopupTitleComponent } from "@/app/shared/components/ui-kit/popup/popup-title/popup-title.component";
import { PopupTextComponent } from "@/app/shared/components/ui-kit/popup/popup-text/popup-text.component";
import { PopupFooterComponent } from "@/app/shared/components/ui-kit/popup/popup-footer/popup-footer.component";

@Component({
    selector: "app-download-app-popup",
    standalone: true,
    imports: [GetAppButtonComponent, PopupLayoutComponent, PopupCloseButtonComponent, PopupTitleComponent, PopupTextComponent, PopupFooterComponent],
    templateUrl: "./download-app-popup.component.html",
    styleUrl: "./download-app-popup.component.scss",
})
export class DownloadAppPopupComponent {
    private dialogRef = inject(MatDialogRef);

    public onCloseDialog(): void {
        this.dialogRef.close();
    }
}
