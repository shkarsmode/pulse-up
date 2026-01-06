
import { NotificationService } from "@/app/shared/services/core/notification.service";
import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output, inject, signal } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { SvgIconComponent } from 'angular-svg-icon';
import { take } from "rxjs";
import { CropImagePopupComponent, CropImagePopupData } from "../../../ui/crop-image-popup/crop-image-popup.component";

@Component({
    selector: 'app-topic-cover-editor',
    standalone: true,
    imports: [CommonModule, SvgIconComponent],
    template: `
        <div class="cover-editor-container">
            <div class="image-wrapper" [class.has-image]="imageUrl()">
                <div class="image-container" *ngIf="imageUrl(); else placeholder">
                     <img [src]="imageUrl()" alt="Topic Cover" class="cover-image" 
                        [style.transform]="getImageTransform()" />
                </div>
                <ng-template #placeholder>
                    <div class="upload-placeholder" (click)="fileInput.click()">
                        <div class="upload-btn">
                            <svg-icon src="assets/svg/plus-circle.svg" [svgStyle]="{ 'width.px': 24, 'height.px': 24 }"></svg-icon>
                             Upload image
                        </div>
                        <div class="upload-hint">Recommended size: 1200x630 px</div>
                    </div>
                </ng-template>
            </div>
            
            <div class="actions-bar" *ngIf="imageUrl()">
                 <button class="icon-btn" title="Zoom In" (click)="zoomIn()"><svg-icon src="assets/svg/plus.svg" [svgStyle]="{ 'width.px': 18, 'height.px': 18 }"></svg-icon></button>
                 <button class="icon-btn" title="Zoom Out" (click)="zoomOut()"><svg-icon src="assets/svg/minus.svg" [svgStyle]="{ 'width.px': 18, 'height.px': 18 }"></svg-icon></button>
                 <button class="icon-btn" title="Rotate" (click)="rotate()"><svg-icon src="assets/svg/arrow-rotate.svg" [svgStyle]="{ 'width.px': 18, 'height.px': 18 }"></svg-icon></button>

                <div class="separator"></div>

                <button class="action-btn" (click)="onRegenerate()" [disabled]="isRegenerating()">
                    <svg-icon src="assets/svg/magic.svg" [svgStyle]="{ 'width.px': 16, 'height.px': 16 }" [class.spin]="isRegenerating()"></svg-icon>
                    {{ isRegenerating() ? 'Regenerating...' : 'Regenerate' }}
                </button>
                
                <button class="action-btn" (click)="fileInput.click()">
                    <svg-icon src="assets/svg/upload.svg" [svgStyle]="{ 'width.px': 16, 'height.px': 16 }"></svg-icon> Change
                </button>
            </div>
            <input #fileInput type="file" (change)="onFileSelected($event)" style="display: none" accept="image/*" />
        </div>
    `,
    styles: [`
        :host { display: block; }
        .cover-editor-container {
            border: 1px solid var(--border-color, #e0e0e0);
            border-radius: 12px;
            overflow: hidden;
            background: var(--bg-card, #fff);
        }
        .image-wrapper {
            width: 100%;
            height: 250px;
            background: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
        }
        .image-wrapper.has-image {
            background: #000;
        }
        .image-container {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        .cover-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.2s ease;
        }
        
        /* Fancy Placeholder */
        .upload-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            background: #f8f7fa; /* Light purple tint */
            cursor: pointer;
            transition: background 0.2s;
        }
        .upload-placeholder:hover {
            background: #f0eff5;
        }
        .upload-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 16px;
            font-weight: 600;
            color: #1e1e2f;
            margin-bottom: 8px;
        }
        .upload-icon {
             font-size: 20px;
             color: #7029ff; /* Purple accent */
        }
         ::ng-deep .upload-btn svg-icon svg {
            fill: #7029ff; /* Force purple specifically for this icon */
             stroke: #7029ff;
        }
        .upload-hint {
            font-size: 13px;
            color: #64748b;
        }

        .actions-bar {
            padding: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-top: 1px solid var(--border-color, #e0e0e0);
            background: #fff;
        }
        .icon-btn {
            background: none;
            border: 1px solid #ddd;
            border-radius: 8px;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: #555;
            &:hover { background: #f9f9f9; }
        }
        .separator {
            width: 1px;
            height: 24px;
            background: #ddd;
            margin: 0 4px;
        }
        .action-btn {
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 6px 12px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
            color: #333;
            
            &:hover:not(:disabled) {
                background: #f5f5f5;
                border-color: #bbb;
            }
            &:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
        }
        .spin {
            animation: spin 1s linear infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
    `]
})
export class TopicCoverEditorComponent {
    public imageUrl = signal<string | null>(null);
    public isRegenerating = signal(false);

    // Transform State
    public scale = signal(1);
    public rotation = signal(0);

    // Initial file backup for processing
    private originalFile: File | null = null;
    private originalBlobUrl: string | null = null;

    @Input() set image(value: string | null) {
        // Reset transforms when image changes externally
        if (value !== this.imageUrl()) {
            this.resetTransforms();
        }
        this.imageUrl.set(value);
        if (value && !value.startsWith('blob:') && !value.startsWith('data:')) {
            // It's a remote URL, we might need to proxy it or just use it if CORS allows
            // For now, assume we can draw it.
        }
    }

    @Output() imageChange = new EventEmitter<File | string>();
    @Output() regenerate = new EventEmitter<void>();

    private dialog = inject(MatDialog);
    private notificationService = inject(NotificationService);

    // Actions
    zoomIn() {
        this.scale.update(s => Math.min(s + 0.1, 3));
    }

    zoomOut() {
        this.scale.update(s => Math.max(s - 0.1, 0.5));
    }

    rotate() {
        this.rotation.update(r => (r + 90) % 360);
    }

    getImageTransform() {
        return `scale(${this.scale()}) rotate(${this.rotation()}deg)`;
    }

    resetTransforms() {
        this.scale.set(1);
        this.rotation.set(0);
    }

    onRegenerate() {
        this.regenerate.emit();
    }

    onFileSelected(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const dialogRef = this.dialog.open<CropImagePopupComponent, CropImagePopupData>(
            CropImagePopupComponent,
            {
                width: "100%",
                maxWidth: "630px",
                panelClass: "custom-dialog-container",
                backdropClass: "custom-dialog-backdrop",
                data: {
                    file: file,
                    aspectRatio: 16 / 9, // Assuming cover image ratio
                    maintainAspectRatio: true,
                },
            },
        );

        dialogRef.afterClosed().pipe(take(1)).subscribe((result) => {
            if (result?.success && result.imageFile) {
                const url = URL.createObjectURL(result.imageFile);
                this.imageUrl.set(url);
                this.originalFile = result.imageFile;
                this.imageChange.emit(result.imageFile);
                this.resetTransforms();
            } else if (result?.message) {
                this.notificationService.error(result.message);
            }
            // Reset input
            (event.target as HTMLInputElement).value = '';
        });
    }


    /**
     * Generates a new File object with the current transforms applied.
     * Use this before uploading.
     */
    async getProcessedFile(): Promise<File | string | null> {
        const url = this.imageUrl();
        if (!url) return null;

        // If no transforms, return original
        if (this.scale() === 1 && this.rotation() === 0) {
            // Try to return the original file if we have it, else return url
            return this.originalFile || url;
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(this.originalFile || url);
                    return;
                }

                // We want to keep the original dimensions but apply transforms.
                // However, rotating 90deg swaps dimensions.
                // The user sees 'object-fit: cover' in a 16:9 box.
                // Reproducing exact visual crop is complex.
                // We will simply apply the transforms to the FULL image and return it.
                // The frontend 'object-fit:cover' handles the display.
                // But "sending modified" usually means we want to bake in the rotation/scale.
                // For simplicity and robustness, we will create a canvas large enough to hold the transformed image.

                const rads = this.rotation() * Math.PI / 180;
                const sin = Math.abs(Math.sin(rads));
                const cos = Math.abs(Math.cos(rads));

                // Calculate new bounding box
                const newWidth = img.width * cos + img.height * sin;
                const newHeight = img.width * sin + img.height * cos;

                // For zoom (scale), we usually crop or expand. 
                // Here we will just scale the image content itself on the canvas.
                // BUT, simply scaling a canvas up doesn't add info. 
                // Let's stick to Rotation primarily, as Zoom usually implies cropping view.
                // If we want to bake Zoom, we should probably Crop to the center??
                // Given the constraints and typical "edit" expectations:
                // We will bake rotation. For Scale, we will just scale the drawing, potentially adding whitespace or cropping if we fixed canvas size.
                // Let's use the bounding box of the ROTATED image, and then scale it.

                canvas.width = newWidth;
                canvas.height = newHeight;

                // Center and rotate
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate(rads);
                ctx.scale(this.scale(), this.scale());
                ctx.drawImage(img, -img.width / 2, -img.height / 2);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const f = new File([blob], "cover-edited.png", { type: "image/png" });
                        resolve(f);
                    } else {
                        resolve(this.originalFile || url);
                    }
                }, 'image/png');
            };
            img.onerror = () => resolve(this.originalFile || url);
            img.src = url;
        });
    }
}
