import { Component, inject } from "@angular/core";
import { PopupLayoutComponent } from "@/app/shared/components/ui-kit/popup/popup.component";
import { PopupSubtitleComponent } from "@/app/shared/components/ui-kit/popup/popup-subtitle/popup-subtitle.component";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { SecondaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/secondary-button/secondary-button.component";
import { MatDialogRef } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { PopupCloseButtonComponent } from "../../../../shared/components/ui-kit/popup/popup-close-button/popup-close-button.component";

@Component({
    selector: "app-topic-location-info-popup",
    standalone: true,
    imports: [
    PopupLayoutComponent,
    PopupSubtitleComponent,
    PrimaryButtonComponent,
    SecondaryButtonComponent,
    PopupCloseButtonComponent
],
    templateUrl: "./topic-location-info-popup.component.html",
    styleUrl: "./topic-location-info-popup.component.scss",
})
export class TopicLocationInfoPopupComponent {
    private readonly router = inject(Router);
    private readonly dialogRef = inject(MatDialogRef);

    onCloseDialog(): void {
        this.dialogRef.close();
    }

    public onConfirm(): void {
        this.dialogRef.close();
        this.router.navigateByUrl("/" + AppRoutes.User.Topic.PICK_LOCATION);
    }

    public onCancel(): void {
        this.dialogRef.close(true);
    }
}
