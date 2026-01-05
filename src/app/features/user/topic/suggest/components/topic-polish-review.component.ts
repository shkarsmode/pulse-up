
import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Input, Output, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { take } from "rxjs";

import { TopicDescriptionComponent } from "@/app/features/user/ui/topic-form/topic-description/topic-description.component";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { ChipsInputComponent } from "@/app/shared/components/ui-kit/chips-input/chips-input.component";
import { InputComponent } from "@/app/shared/components/ui-kit/input/input.component";
import { NotificationService } from "@/app/shared/services/core/notification.service";
import { CropImagePopupComponent, CropImagePopupData } from "../../../ui/crop-image-popup/crop-image-popup.component";
import { TopicCoverEditorComponent } from "./topic-cover-editor.component";

@Component({
    selector: "app-topic-polish-review",
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputComponent,
        TopicDescriptionComponent,
        PrimaryButtonComponent,
        ChipsInputComponent,
        TopicCoverEditorComponent
    ],
    template: `
        <div class="header">
            <button class="back-btn" (click)="onBack()"><i class="icon-arrow-left"></i> Edit Original</button>
        </div>
        <h1>Your Topic, Polished</h1>
        <div class="description-text">Review and finalize before publishing.</div>

        <div class="card-container">
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
                
                <!-- Cover Image Section -->
                <div class="section">
                    <app-topic-cover-editor
                        [image]="selectedCoverImage()"
                        (imageChange)="onCoverImageChange($event)"
                        (regenerate)="onRegenerateCover()"
                    ></app-topic-cover-editor>
                </div>

                <!-- Map Icon Section -->
                <div class="section icon-section">
                    <div class="section-label">Choose Your Map Icon</div>
                    <div class="icon-selection">
                        <div 
                            class="icon-option" 
                            [class.selected]="selectedIcon() === generatedPhotoIcon"
                            (click)="selectIcon(generatedPhotoIcon)"
                            *ngIf="generatedPhotoIcon">
                            <img [src]="generatedPhotoIcon" />
                            <div class="check-badge" *ngIf="selectedIcon() === generatedPhotoIcon"><i class="icon-check"></i></div>
                        </div>
                        <div 
                            class="icon-option" 
                            [class.selected]="selectedIcon() === generatedSymbolicIcon"
                            (click)="selectIcon(generatedSymbolicIcon)"
                            *ngIf="generatedSymbolicIcon">
                            <img [src]="generatedSymbolicIcon" />
                            <div class="check-badge" *ngIf="selectedIcon() === generatedSymbolicIcon"><i class="icon-check"></i></div>
                        </div>
                         <!-- Upload Option -->
                         <div class="icon-option upload" (click)="uploadIcon()" [class.selected]="isCustomIcon()">
                            <img [src]="customIconUrl()" *ngIf="customIconUrl(); else uploadPlaceholder" class="custom-icon-img"/>
                            <ng-template #uploadPlaceholder>
                                <div class="upload-content">
                                    <i class="icon-upload"></i>
                                    <span>Upload</span>
                                </div>
                            </ng-template>
                         </div>
                    </div>
                     <div class="map-link">
                        <i class="icon-map"></i> How it looks on the map <i class="icon-chevron-down"></i>
                    </div>
                </div>


                <div class="section">
                    <app-input
                        formControlName="title"
                        label="Topic Title"
                        placeholder="Enter topic title"
                    />
                </div>

                <div class="section">
                    <app-topic-description
                        [textControl]="form.controls.description"
                        label="Description"
                    />
                </div>
                
                <div class="section">
                     <app-chips-input
                        formControlName="tags"
                        label="Tags"
                        [limit]="5"
                    />
                </div>
                
                <div class="section">
                    <!-- Audience - Mocked for now as per design -->
                     <div class="audience-select">
                        <label>Audience</label>
                        <div class="fake-select">
                            <i class="icon-globe"></i> Global <i class="icon-chevron-down arrow"></i>
                        </div>
                     </div>
                </div>

                <!-- Spacer -->
                <div style="height: 24px"></div>

                <app-primary-button
                    [fullWidth]="true"
                    (handleClick)="onSubmit()"
                >
                    Publish Topic
                </app-primary-button>
            </form>
        </div>
    `,
    styles: [`
        :host { display: block; max-width: 600px; margin: 0 auto; padding-bottom: 40px; }
        .back-btn { background: none; border: none; cursor: pointer; color: var(--text-primary); display: flex; align-items: center; gap: 8px; margin-bottom: 16px; font-weight: 600; padding: 0;}
        h1 { margin-bottom: 8px; font-size: 24px; font-weight: 700; }
        .description-text { margin-bottom: 24px; color: var(--text-secondary); }
        
        .card-container {
            background: #fff;
            border: 1px solid #eee;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05); /* Premium shadow */
        }
        
        .section { margin-bottom: 24px; }
        .section-label { font-weight: 600; margin-bottom: 12px; color: var(--text-secondary); font-size: 14px; }
        
        /* Icon Selection */
        .icon-selection { display: flex; gap: 12px; margin-bottom: 8px; }
        .icon-option { 
            width: 72px; height: 72px; 
            border-radius: 12px; 
            overflow: hidden; 
            cursor: pointer; 
            border: 2px solid #eee; 
            position: relative;
            transition: all 0.2s;
        }
        .icon-option:hover { border-color: #ccc; }
        .icon-option.selected { border-color: #000; box-shadow: 0 0 0 1px #000; } /* Black accent */
        .icon-option img, .custom-icon-img { width: 100%; height: 100%; object-fit: cover; }
        .check-badge {
            position: absolute; top: 4px; right: 4px;
            background: #000; color: #fff;
            width: 16px; height: 16px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 10px;
        }
        
        .icon-option.upload { 
            background: #f9f9f9; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
        }
        .upload-content { display: flex; flex-direction: column; align-items: center; gap: 4px; color: #666; font-size: 11px; font-weight: 500;}
        
        .map-link { font-size: 13px; color: var(--text-primary); text-decoration: underline; cursor: pointer; display: flex; align-items: center; gap: 6px; }

        /* Fake Select */
        .audience-select label { display: block; font-weight: 500; margin-bottom: 8px; font-size: 14px; color: var(--text-secondary); }
        .fake-select {
            border: 1px solid #ddd; border-radius: 8px; padding: 10px 12px;
            display: flex; align-items: center; gap: 8px;
            color: #333; font-weight: 500;
        }
        .fake-select .arrow { margin-left: auto; color: #999; }
    `]
})
export class TopicPolishReviewComponent {
    @Input() set data(value: any) {
        if (value) {
            this.form.patchValue({
                title: value.polishedTitle,
                description: value.polishedDescription,
                tags: value.tags || []
            });
            if (value.coverImage) this.selectedCoverImage.set(value.coverImage);
            if (value.photoIcon) this.generatedPhotoIcon = value.photoIcon;
            if (value.symbolicIcon) this.generatedSymbolicIcon = value.symbolicIcon;

            // Auto-select one
            if (value.symbolicIcon) this.selectIcon(value.symbolicIcon);
        }
    }

    @Output() publish = new EventEmitter<any>();
    @Output() back = new EventEmitter<void>();
    @Output() regenerateCover = new EventEmitter<void>();

    public form = new FormGroup({
        title: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
        description: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
        tags: new FormControl<string[]>([], { nonNullable: true }),
    });

    public selectedCoverImage = signal<string | null>(null);
    public finalCoverFile: File | string | null = null; // Store actual file if uploaded

    public selectedIcon = signal<string | null>(null);
    public customIconUrl = signal<string | null>(null);
    public finalIconFile: File | string | null = null;

    public generatedPhotoIcon: string | null = null;
    public generatedSymbolicIcon: string | null = null;

    private dialog = inject(MatDialog);
    private notificationService = inject(NotificationService);

    selectIcon(icon: string | null) {
        this.selectedIcon.set(icon);
    }

    isCustomIcon(): boolean {
        return this.selectedIcon() === this.customIconUrl();
    }

    onCoverImageChange(fileOrUrl: File | string) {
        if (typeof fileOrUrl === 'string') {
            // It's a URL
            this.selectedCoverImage.set(fileOrUrl);
            this.finalCoverFile = fileOrUrl;
        } else {
            // It's a File
            const url = URL.createObjectURL(fileOrUrl);
            this.selectedCoverImage.set(url);
            this.finalCoverFile = fileOrUrl;
        }
    }

    onRegenerateCover() {
        this.regenerateCover.emit();
    }

    onBack() {
        this.back.emit();
    }

    onSubmit() {
        if (this.form.valid) {
            this.publish.emit({
                ...this.form.value,
                icon: this.finalIconFile || this.selectedIcon(), // Prefer file if uploaded, else URL
                picture: this.finalCoverFile || this.selectedCoverImage()
            });
        }
    }

    uploadIcon() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e: any) => {
            const file = e.target.files[0];
            if (file) this.openIconCropper(file);
        };
        input.click();
    }

    openIconCropper(file: File) {
        // Reusing same cropper but for square aspect ratio
        // For now, mocking the event structure expected by CropImagePopup
        // In reality, we might need to adjust CropImagePopup to accept File directly or fake event

        // Mocking event requires a bit of work, skipping strict typing for 'event' momentarily
        const mockEvent = { target: { files: [file] } } as unknown as Event;

        const dialogRef = this.dialog.open<CropImagePopupComponent, CropImagePopupData>(
            CropImagePopupComponent,
            {
                width: "100%",
                maxWidth: "630px",
                panelClass: "custom-dialog-container",
                backdropClass: "custom-dialog-backdrop",
                data: {
                    event: mockEvent,
                    aspectRatio: 1, // Square for icon
                    maintainAspectRatio: true,
                },
            },
        );

        dialogRef.afterClosed().pipe(take(1)).subscribe((result) => {
            if (result?.success && result.imageFile) {
                const url = URL.createObjectURL(result.imageFile);
                this.customIconUrl.set(url);
                this.selectIcon(url);
                this.finalIconFile = result.imageFile;
            } else if (result?.message) {
                this.notificationService.error(result.message);
            }
        });
    }
}
