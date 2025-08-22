import { Directive, HostListener } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";

@Directive({
    selector: "[openGetAppPopup]",
    standalone: true,
})
export class OpenGetAppPopupDirective {
    constructor(private dialog: MatDialog) {}

    @HostListener("click")
    openPopup(): void {
        import("./get-app-popup.component").then(({ GetAppPopupComponent }) => {
            this.dialog.open(GetAppPopupComponent, {
                width: "630px",
                panelClass: "custom-dialog-container",
            });
        });
    }
}
