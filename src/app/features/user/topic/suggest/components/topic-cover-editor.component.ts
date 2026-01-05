
import { NotificationService } from "@/app/shared/services/core/notification.service";
import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output, inject, signal } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { take } from "rxjs";
import { CropImagePopupComponent, CropImagePopupData } from "../../../ui/crop-image-popup/crop-image-popup.component";

@Component({
    selector: 'app-topic-cover-editor',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="cover-editor-container">
            <div class="image-wrapper">
                <img [src]="imageUrl()" alt="Topic Cover" class="cover-image" *ngIf="imageUrl(); else placeholder" />
                <ng-template #placeholder>
                    <div class="placeholder">No Image</div>
                </ng-template>
            </div>
            
            <div class="actions-bar">
                 <!-- Zoom/Rotate icons mocked for design compliance -->
                 <button class="icon-btn" title="Zoom In"><i class="icon-zoom-in"></i></button> <!-- Placeholder icons -->
                 <button class="icon-btn" title="Zoom Out"><i class="icon-zoom-out"></i></button>
                 <button class="icon-btn" title="Rotate"><i class="icon-refresh"></i></button>

                <div class="separator"></div>

                <button class="action-btn" (click)="onRegenerate()" [disabled]="isRegenerating()">
                    <i class="icon-refresh" [class.spin]="isRegenerating()"></i> 
                    {{ isRegenerating() ? 'Regenerating...' : 'Regenerate' }}
                </button>
                
                <button class="action-btn" (click)="fileInput.click()">
                    <i class="icon-upload"></i> Upload
                </button>
                <input #fileInput type="file" (change)="onFileSelected($event)" style="display: none" accept="image/*" />
            </div>
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
            height: 250px; /* Adjust as needed */
            background: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }
        .cover-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .placeholder {
            color: #999;
        }
        .actions-bar {
            padding: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-top: 1px solid var(--border-color, #e0e0e0);
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

    @Input() set image(value: string | null) {
        this.imageUrl.set(value);
    }

    @Output() imageChange = new EventEmitter<File | string>();
    @Output() regenerate = new EventEmitter<void>();

    private dialog = inject(MatDialog);
    private notificationService = inject(NotificationService);

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
                    event: event,
                    aspectRatio: 16 / 9, // Assuming cover image ratio
                    maintainAspectRatio: true,
                },
            },
        );

        dialogRef.afterClosed().pipe(take(1)).subscribe((result) => {
            if (result?.success && result.imageFile) {
                const url = URL.createObjectURL(result.imageFile);
                this.imageUrl.set(url);
                this.imageChange.emit(result.imageFile);
            } else if (result?.message) {
                this.notificationService.error(result.message);
            }
            // Reset input
            (event.target as HTMLInputElement).value = '';
        });
    }
}
