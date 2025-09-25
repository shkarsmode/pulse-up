import { Component, inject, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppRoutes } from '@/app/shared/enums/app-routes.enum';
import { AuthenticationService } from '@/app/shared/services/api/authentication.service';
import { PrimaryButtonComponent } from "../../ui-kit/buttons/primary-button/primary-button.component";

@Component({
  selector: 'app-change-email-popup',
  standalone: true,
  imports: [PrimaryButtonComponent],
  templateUrl: './change-email-popup.component.html',
  styleUrl: './change-email-popup.component.scss'
})
export class ChangeEmailPopupComponent {
  @Input() public mode: 'verifyEmail' | 'changeEmail' = 'verifyEmail';

  private readonly authenticationService = inject(AuthenticationService);
  private readonly dialogRef: MatDialogRef<ChangeEmailPopupComponent> = inject(MatDialogRef);
  private readonly data: { mode: 'verifyEmail' | 'changeEmail' } = inject(MAT_DIALOG_DATA);

  public get isVerifyEmailMode(): boolean {
    return this.data.mode === 'verifyEmail';
  }

  public onCloseDialog(): void {
    this.dialogRef.close();
  }

  public logout(): void {
    this.dialogRef.close();
    this.authenticationService.logout({
      navigationUrl: `/${AppRoutes.Auth.SIGN_IN_WITH_PHONE}?redirect=${AppRoutes.Profile.EDIT}`
    })
  }
}
