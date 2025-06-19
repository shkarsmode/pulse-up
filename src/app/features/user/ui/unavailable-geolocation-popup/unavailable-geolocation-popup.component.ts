import { Component, inject } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { PopupLayoutComponent } from "@/app/shared/components/ui-kit/popup/popup.component";
import { PopupCloseButtonComponent } from "@/app/shared/components/ui-kit/popup/popup-close-button/popup-close-button.component";
import { PopupTitleComponent } from "@/app/shared/components/ui-kit/popup/popup-title/popup-title.component";
import { PopupTextComponent } from "@/app/shared/components/ui-kit/popup/popup-text/popup-text.component";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";

@Component({
    selector: "app-unavailable-geolocation-popup",
    standalone: true,
    imports: [PopupLayoutComponent, PopupCloseButtonComponent, PopupTitleComponent, PopupTextComponent, PrimaryButtonComponent],
    templateUrl: "./unavailable-geolocation-popup.component.html",
    styleUrl: "./unavailable-geolocation-popup.component.scss",
})
export class UnavailableGeolocationPopupComponent {
    private readonly dialogRef = inject(MatDialogRef);

    onCloseDialog(): void {
        this.dialogRef.close();
    }

    onContinue(): void {
        this.dialogRef.close("continue");
    }
}
