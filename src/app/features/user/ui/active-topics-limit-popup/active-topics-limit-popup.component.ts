import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PopupLayoutComponent } from "@/app/shared/components/ui-kit/popup/popup.component";
import { PopupTitleComponent } from "@/app/shared/components/ui-kit/popup/popup-title/popup-title.component";
import { PopupTextComponent } from "@/app/shared/components/ui-kit/popup/popup-text/popup-text.component";
import { PopupCloseButtonComponent } from "@/app/shared/components/ui-kit/popup/popup-close-button/popup-close-button.component";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";

@Component({
  selector: 'app-topics-limit-popup',
  standalone: true,
  imports: [PopupLayoutComponent, PopupTitleComponent, PopupTextComponent, PopupCloseButtonComponent, PrimaryButtonComponent],
  templateUrl: './active-topics-limit-popup.component.html',
  styleUrl: './active-topics-limit-popup.component.scss'
})
export class ActiveTopicsLimitPopupComponent {
  private readonly dialogRef: MatDialogRef<ActiveTopicsLimitPopupComponent> = inject(MatDialogRef);

  public onCloseDialog(): void {
    this.dialogRef.close();
  }
}
