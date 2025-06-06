import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SvgIconComponent } from 'angular-svg-icon';
import { GetAppButtonComponent } from '../../ui-kit/buttons/get-app-button/get-app-button.component';
import { CloseButtonComponent } from '../../ui-kit/buttons/close-button/close-button.component';
import { MatDialogRef } from '@angular/material/dialog';
import { HeartBeatDirective } from '../../../animations/heart-beat.directive';
import { PrimaryButtonComponent } from "../../ui-kit/buttons/primary-button/primary-button.component";
import { Router } from '@angular/router';
import { AppRoutes } from '@/app/shared/enums/app-routes.enum';

@Component({
  selector: 'app-add-topic-popup',
  standalone: true,
  imports: [
    CommonModule,
    SvgIconComponent,
    CloseButtonComponent,
    HeartBeatDirective,
    PrimaryButtonComponent
  ],
  templateUrl: './add-topic-popup.component.html',
  styleUrl: './add-topic-popup.component.scss'
})
export class AddTopicPopupComponent {
  private readonly router: Router = inject(Router);
  private readonly dialogRef: MatDialogRef<GetAppButtonComponent> = inject(MatDialogRef);

  public onCloseDialog(): void {
    this.dialogRef.close();
  }

  public onSignIn(): void {
    this.dialogRef.close();
    this.router.navigateByUrl(`${AppRoutes.Auth.SIGN_IN}?redirect=${AppRoutes.Landing.TOPICS}`, { replaceUrl: true });
  }
}
