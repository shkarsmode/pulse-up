import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
  selector: 'app-popup-back-button',
  templateUrl: './popup-back-button.component.html',
  styleUrl: './popup-back-button.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    SvgIconComponent
  ]
})
export class PopupBackButtonComponent {
    @Output() back = new EventEmitter<void>();

    public onBack() {
        this.back.emit();
    }
}
