import { Component, EventEmitter, Output } from '@angular/core';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
  selector: 'app-qrcode-button',
  standalone: true,
  imports: [SvgIconComponent],
  templateUrl: './qrcode-button.component.html',
  styleUrl: './qrcode-button.component.scss'
})
export class QrcodeButtonComponent {
  @Output() handleClick = new EventEmitter<void>();
  onClick(): void {
    this.handleClick.emit();
  }
}
