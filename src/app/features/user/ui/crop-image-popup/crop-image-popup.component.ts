import { Component, ElementRef, inject, Input, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatSliderModule } from "@angular/material/slider";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import {
    ImageCropperComponent,
    ImageCroppedEvent,
    LoadedImage,
    ImageTransform,
} from "ngx-image-cropper";
import { PopupLayoutComponent } from "@/app/shared/components/ui-kit/popup/popup.component";
import { PopupCloseButtonComponent } from "@/app/shared/components/ui-kit/popup/popup-close-button/popup-close-button.component";
import { SpinnerComponent } from "../../../../shared/components/ui-kit/spinner/spinner.component";
import { SecondaryButtonComponent } from "../../../../shared/components/ui-kit/buttons/secondary-button/secondary-button.component";
import { PrimaryButtonComponent } from "../../../../shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { SvgIconComponent } from "angular-svg-icon";
import { CropResult } from "../../interfaces/crop-result.interface";

export interface CropImagePopupData {
    event: Event;
    minWidth?: number;
    minHeight?: number;
    aspectRatio?: number;
    maintainAspectRatio?: boolean;
}

@Component({
    selector: "app-crop-image-popup",
    standalone: true,
    imports: [
        CommonModule,
        SvgIconComponent,
        MatSliderModule,
        PopupLayoutComponent,
        PopupCloseButtonComponent,
        ImageCropperComponent,
        SpinnerComponent,
        SecondaryButtonComponent,
        PrimaryButtonComponent,
    ],
    templateUrl: "./crop-image-popup.component.html",
    styleUrl: "./crop-image-popup.component.scss",
})
export class CropImagePopupComponent {
    @ViewChild("spinner") spinnerRef!: ElementRef<HTMLDivElement>;

    private readonly sanitizer: DomSanitizer = inject(DomSanitizer);
    private readonly dialogRef: MatDialogRef<CropImagePopupComponent> = inject(MatDialogRef);
    private readonly data: CropImagePopupData = inject(MAT_DIALOG_DATA);

    minScale: number = 1;
    maxScale: number = 3;
    stepScale: number = 0.01;
    imageChangedEvent: Event | null = null;
    croppedImageUrl: SafeUrl = "";
    croppedImageBlob: Blob | null = null;
    sourceImageLoaded: boolean = false;
    scale = this.minScale;
    rotation = 0;
    canvasRotation = 0;
    transform: ImageTransform = {};
    aspectRatio = this.data.aspectRatio || 1;
    minWidth = this.data.minWidth || 100;
    minHeight = this.data.minHeight || 100;
    maintainAspectRatio = this.data.maintainAspectRatio ?? true;
    classes = {
        cropper: {},
        spinner: {},
    };

    constructor() {
        this.imageChangedEvent = this.data.event;
        this.updateClasses();
    }

    imageCropped(event: ImageCroppedEvent) {
        console.log("Image cropped event:", event);
        this.croppedImageUrl = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl || "");
        this.croppedImageBlob = event.blob || null;
    }
    imageLoaded(image: LoadedImage) {
        this.sourceImageLoaded = true;
        this.hideSpinner();
        this.updateClasses();
    }

    loadImageFailed() {
        this.closeDialog({
            success: false,
            message: "Image loading failed",
        });
    }

    resetImage() {
        this.scale = 1;
        this.rotation = 0;
        this.canvasRotation = 0;
        this.transform = {};
    }

    zoomOut() {
        this.scale -= 0.1;
        this.transform = {
            ...this.transform,
            scale: this.scale,
        };
    }

    zoomIn() {
        this.scale += 0.1;
        this.transform = {
            ...this.transform,
            scale: this.scale,
        };
    }

    zoomChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const value = parseFloat(target.value);
        if (!isNaN(value)) {
            this.scale = value;
            this.transform = {
                ...this.transform,
                scale: this.scale,
            };
        }
    }

    rotateLeft() {
        this.canvasRotation--;
        this.flipAfterRotate();
    }

    rotateRight() {
        this.canvasRotation++;
        this.flipAfterRotate();
    }

    onCancel() {
        this.closeDialog({
            success: false,
        });
    }

    onSave() {
        if (this.croppedImageBlob) {
            this.closeDialog({
                success: true,
                imageUrl: this.croppedImageUrl as string,
                imageFile: new File(
                    [this.croppedImageBlob],
                    (this.imageChangedEvent?.target as HTMLInputElement)?.files?.[0]?.name ||
                        "cropped-image",
                    { type: this.croppedImageBlob.type },
                ),
            });
        }
    }

    private hideSpinner() {
        if (this.spinnerRef) {
            setTimeout(() => {
                this.spinnerRef.nativeElement.classList.add("cropper__spinner--hidden");
            }, 200);
        }
    }

    private updateClasses() {
        this.classes = {
            cropper: {
                cropper__wrap: true,
                "cropper__wrap--visible": this.sourceImageLoaded,
            },
            spinner: {
                cropper__spinner: true,
                "cropper__spinner--visible": this.sourceImageLoaded,
            },
        };
    }

    private flipAfterRotate() {
        const flippedH = this.transform.flipH;
        const flippedV = this.transform.flipV;
        this.transform = {
            ...this.transform,
            flipH: flippedV,
            flipV: flippedH,
        };
    }

    private closeDialog(data: CropResult) {
        this.dialogRef.close(data);
    }
}
