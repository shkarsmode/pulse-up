import { Component, inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { PopupLayoutComponent } from "@/app/shared/components/ui-kit/popup/popup.component";
import { PopupTextComponent } from "@/app/shared/components/ui-kit/popup/popup-text/popup-text.component";
import { PopupSubtitleComponent } from "@/app/shared/components/ui-kit/popup/popup-subtitle/popup-subtitle.component";
import { PopupFooterComponent } from "@/app/shared/components/ui-kit/popup/popup-footer/popup-footer.component";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";

interface LeaderboardInfoPopupData {
    type: "Active" | "Upcoming" | "Ended";
}

@Component({
    selector: "app-leaderboard-info-popup",
    standalone: true,
    imports: [
        PopupLayoutComponent,
        PopupTextComponent,
        PopupSubtitleComponent,
        PopupFooterComponent,
        PrimaryButtonComponent,
    ],
    templateUrl: "./leaderboard-info-popup.component.html",
    styleUrl: "./leaderboard-info-popup.component.scss",
})
export class LeaderboardInfoPopupComponent {
    private readonly dialogRef = inject(MatDialogRef<LeaderboardInfoPopupComponent>);
    public readonly data: LeaderboardInfoPopupData = inject(MAT_DIALOG_DATA);

    closePopup() {
        this.dialogRef.close();
    }
}
