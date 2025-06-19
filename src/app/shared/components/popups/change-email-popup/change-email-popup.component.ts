import { Component, inject, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PrimaryButtonComponent } from "../../ui-kit/buttons/primary-button/primary-button.component";
import { Router } from '@angular/router';
import { AppRoutes } from '@/app/shared/enums/app-routes.enum';

@Component({
  selector: 'app-change-email-popup',
  standalone: true,
  imports: [PrimaryButtonComponent],
  templateUrl: './change-email-popup.component.html',
  styleUrl: './change-email-popup.component.scss'
})
export class ChangeEmailPopupComponent {
  @Input() public mode: 'verifyEmail' | 'changeEmail' = 'verifyEmail';

  private readonly router: Router = inject(Router);
  private readonly dialogRef: MatDialogRef<any> = inject(MatDialogRef);
  private readonly data: { mode: 'verifyEmail' | 'changeEmail' } = inject(MAT_DIALOG_DATA);

  public get isVerifyEmailMode(): boolean {
    return this.data.mode === 'verifyEmail';
  }

  public onCloseDialog(): void {
    this.dialogRef.close();
  }

  public logout(): void {
    this.dialogRef.close();
    this.router.navigateByUrl(`/${AppRoutes.Auth.SIGN_IN}?redirect=${AppRoutes.Profile.EDIT}`)
  }
}
