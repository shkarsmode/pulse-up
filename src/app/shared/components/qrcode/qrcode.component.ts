import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-qrcode',
  templateUrl: './qrcode.component.html',
  styleUrl: './qrcode.component.scss'
})
export class QrcodeComponent {
  @Input() data: string = '';
  @Input() size: number = 256;
  @Input() rounded: boolean = false;
  @Input() accessibleLabel: string = 'QR Code';
}
