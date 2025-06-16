import { Component, inject } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ContainerComponent } from "@/app/shared/components/ui-kit/container/container.component";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { DeleteAccountPopupComponent } from "../../ui/delete-account-popup/delete-account-popup.component";

@Component({
    selector: "app-delete-account",
    standalone: true,
    imports: [ContainerComponent, PrimaryButtonComponent],
    templateUrl: "./delete-account.component.html",
    styleUrl: "./delete-account.component.scss",
})
export class DeleteAccountComponent {
    private dialog = inject(MatDialog);
    onDeleteAccount() {
        this.dialog.open(DeleteAccountPopupComponent, {
            width: "630px",
            panelClass: "custom-dialog-container",
            backdropClass: "custom-dialog-backdrop",
        });
    }
}
