import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CloseButtonComponent } from "../../ui-kit/buttons/close-button/close-button.component";
import { PrimaryButtonComponent } from "../../ui-kit/buttons/primary-button/primary-button.component";
import { Router } from '@angular/router';
import { AppRoutes } from '@/app/shared/enums/app-routes.enum';

@Component({
  selector: 'app-change-email-popup',
  standalone: true,
  imports: [CloseButtonComponent, PrimaryButtonComponent],
  templateUrl: './change-email-popup.component.html',
  styleUrl: './change-email-popup.component.scss'
})
export class ChangeEmailPopupComponent {

  private readonly router: Router = inject(Router);
  private readonly dialogRef: MatDialogRef<any> = inject(MatDialogRef);

  public onCloseDialog(): void {
    this.dialogRef.close();
  }

  public logout(): void {
    this.dialogRef.close();
    this.router.navigateByUrl(`/${AppRoutes.Auth.SIGN_IN}?redirect=${AppRoutes.Profile.EDIT}`)
  }
}
