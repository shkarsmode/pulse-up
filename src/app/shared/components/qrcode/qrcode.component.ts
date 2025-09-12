import { Component, EventEmitter, Input, Output } from "@angular/core";
import { SafeUrl } from "@angular/platform-browser";

@Component({
    selector: "app-qrcode",
    templateUrl: "./qrcode.component.html",
    styleUrl: "./qrcode.component.scss",
})
export class QrcodeComponent {
    @Input() data = "";
    @Input() size = 256;
    @Input() rounded = false;
    @Input() accessibleLabel = "QR Code";

    @Output() qrCodeURL = new EventEmitter<SafeUrl>();

    public onChangeURL(url: SafeUrl) {
        this.qrCodeURL.emit(url);
    }
}
