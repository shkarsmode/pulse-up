import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-qrcode',
  templateUrl: './qrcode.component.html',
  styleUrl: './qrcode.component.scss'
})
export class QrcodeComponent {
  @Input() data = '';
  @Input() size = 256;
  @Input() rounded = false;
  @Input() accessibleLabel = 'QR Code';
}
