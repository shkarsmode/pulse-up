import { Component, inject } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { PopupLayoutComponent } from "@/app/shared/components/ui-kit/popup/popup.component";
import { PopupCloseButtonComponent } from "@/app/shared/components/ui-kit/popup/popup-close-button/popup-close-button.component";
import { PopupTextComponent } from "@/app/shared/components/ui-kit/popup/popup-text/popup-text.component";
import { PopupFooterComponent } from "@/app/shared/components/ui-kit/popup/popup-footer/popup-footer.component";
import { SecondaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/secondary-button/secondary-button.component";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { VotingService } from "@/app/shared/services/core/voting.service";

@Component({
    selector: "app-accept-rules-popup",
    standalone: true,
    imports: [
        PopupLayoutComponent,
        PopupCloseButtonComponent,
        PopupTextComponent,
        PopupFooterComponent,
        SecondaryButtonComponent,
        PrimaryButtonComponent,
    ],
    templateUrl: "./accept-rules-popup.component.html",
    styleUrl: "./accept-rules-popup.component.scss",
})
export class AcceptRulesPopupComponent {
    private readonly dialogRef = inject(MatDialogRef<AcceptRulesPopupComponent>);
    private readonly votingService = inject(VotingService);

    onClose() {
        this.dialogRef.close();
    }

    onAccept() {
        this.dialogRef.close(true);
        setTimeout(() => {
            this.votingService.askForGeolocation();
        }, 250)
    }
}
