import { Component, inject } from "@angular/core";
import { delay, take } from "rxjs";
import { MatDialogRef } from "@angular/material/dialog";
import { PopupLayoutComponent } from "@/app/shared/components/ui-kit/popup/popup.component";
import { PopupCloseButtonComponent } from "@/app/shared/components/ui-kit/popup/popup-close-button/popup-close-button.component";
import { PopupTextComponent } from "@/app/shared/components/ui-kit/popup/popup-text/popup-text.component";
import { PopupFooterComponent } from "@/app/shared/components/ui-kit/popup/popup-footer/popup-footer.component";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { PopupTitleComponent } from "@/app/shared/components/ui-kit/popup/popup-title/popup-title.component";
import { VotingService } from "@/app/shared/services/votes/voting.service";

@Component({
    selector: "app-accept-rules-popup",
    standalone: true,
    imports: [
        PopupLayoutComponent,
        PopupCloseButtonComponent,
        PopupTextComponent,
        PopupFooterComponent,
        PrimaryButtonComponent,
        PopupTitleComponent,
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
        this.dialogRef
            .afterClosed()
            .pipe(take(1), delay(250))
            .subscribe(() => {
                this.votingService.askForGeolocation();
            });
    }
}
