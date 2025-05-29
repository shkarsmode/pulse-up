import { Directive, HostListener, inject } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { CompleteProfilePopupComponent } from "./complete-profile-popup.component";

@Directive({
  selector: "[openCompleteProfilePopup]",
  standalone: true,
})
export class CompleteProfilePopupDirective {
  private readonly dialog: MatDialog = inject(MatDialog);

  @HostListener('click')
  openPopup(): void {
    this.dialog.open(CompleteProfilePopupComponent, {
      width: "630px",
      panelClass: "custom-dialog-container",
      backdropClass: "custom-dialog-backdrop",
    })
  }
}