import { NgModule } from "@angular/core";
import { QrcodeComponent } from "../components/qrcode/qrcode.component";
import { QRCodeModule } from "angularx-qrcode";

@NgModule({
    declarations: [QrcodeComponent],
    imports: [QRCodeModule],
    exports: [QrcodeComponent],
})
export class SharedModule {}
