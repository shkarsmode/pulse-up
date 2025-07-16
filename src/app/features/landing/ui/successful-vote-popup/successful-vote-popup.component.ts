import { Component, inject } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { PopupLayoutComponent } from "@/app/shared/components/ui-kit/popup/popup.component";
import { PopupCloseButtonComponent } from "@/app/shared/components/ui-kit/popup/popup-close-button/popup-close-button.component";
import { PopupTitleComponent } from "@/app/shared/components/ui-kit/popup/popup-title/popup-title.component";
import { PopupTextComponent } from "@/app/shared/components/ui-kit/popup/popup-text/popup-text.component";
import { PopupFooterComponent } from "@/app/shared/components/ui-kit/popup/popup-footer/popup-footer.component";
import { SecondaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/secondary-button/secondary-button.component";
import { GetAppButtonComponent } from "@/app/shared/components/ui-kit/buttons/get-app-button/get-app-button.component";
import { SvgIconComponent } from "angular-svg-icon";
import { PopupSubtitleComponent } from "@/app/shared/components/ui-kit/popup/popup-subtitle/popup-subtitle.component";

@Component({
    selector: "app-successful-vote-popup",
    standalone: true,
    imports: [
        PopupLayoutComponent,
        PopupCloseButtonComponent,
        PopupTitleComponent,
        PopupTextComponent,
        GetAppButtonComponent,
        SvgIconComponent,
        PopupSubtitleComponent
    ],
    templateUrl: "./successful-vote-popup.component.html",
    styleUrl: "./successful-vote-popup.component.scss",
})
export class SuccessfulVotePopupComponent {
    private readonly dialogRef = inject(MatDialogRef<SuccessfulVotePopupComponent>);

    onClose() {
        this.dialogRef.close();
    }
}
