import { Component, inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { ImageCropperComponent, ImageCroppedEvent, LoadedImage } from "ngx-image-cropper";
import { PopupLayoutComponent } from "@/app/shared/components/ui-kit/popup/popup.component";
import { PopupTitleComponent } from "@/app/shared/components/ui-kit/popup/popup-title/popup-title.component";
import { PopupCloseButtonComponent } from "@/app/shared/components/ui-kit/popup/popup-close-button/popup-close-button.component";

@Component({
    selector: "app-crop-image-popup",
    standalone: true,
    imports: [
        PopupLayoutComponent,
        PopupTitleComponent,
        PopupCloseButtonComponent,
        ImageCropperComponent,
    ],
    templateUrl: "./crop-image-popup.component.html",
    styleUrl: "./crop-image-popup.component.scss",
})
export class CropImagePopupComponent {
    private readonly sanitizer: DomSanitizer = inject(DomSanitizer);
    private readonly dialogRef: MatDialogRef<CropImagePopupComponent>;
    private readonly data: { event: Event } = inject(MAT_DIALOG_DATA);

    imageChangedEvent: Event | null = null;
    croppedImage: SafeUrl = "";

    constructor() {
        this.imageChangedEvent = this.data.event;
    }

    imageCropped(event: ImageCroppedEvent) {
        this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl || "");
        // event.blob can be used to upload the cropped image
    }
    imageLoaded(image: LoadedImage) {
        // show cropper
    }
    cropperReady() {
        // cropper ready
    }
    loadImageFailed() {
        // show message
    }

    closeDialog() {
        this.dialogRef.close();
    }
}
