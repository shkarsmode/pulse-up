import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SvgIconComponent } from 'angular-svg-icon';
import { GetAppButtonComponent } from '../../ui-kit/buttons/get-app-button/get-app-button.component';
import { CloseButtonComponent } from '../../ui-kit/buttons/close-button/close-button.component';
import { MatDialogRef } from '@angular/material/dialog';
import { HeartBeatDirective } from '../../../animations/heart-beat.directive';

@Component({
  selector: 'app-add-topic-popup',
  standalone: true,
  imports: [
    CommonModule,
    SvgIconComponent,
    GetAppButtonComponent,
    CloseButtonComponent,
    HeartBeatDirective, 
  ],
  templateUrl: './add-topic-popup.component.html',
  styleUrl: './add-topic-popup.component.scss'
})
export class AddTopicPopupComponent {

  constructor(
    public dialogRef: MatDialogRef<GetAppButtonComponent>,    
  ) {}


  public onCloseDialog(): void {
      this.dialogRef.close();
  }
}
