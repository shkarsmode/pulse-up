
import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { SvgIconComponent } from 'angular-svg-icon';
import { map, take } from "rxjs";

import { TopicDescriptionComponent } from "@/app/features/user/ui/topic-form/topic-description/topic-description.component";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { ChipsInputComponent } from "@/app/shared/components/ui-kit/chips-input/chips-input.component";
import { InputComponent } from "@/app/shared/components/ui-kit/input/input.component";
import { SelectComponent } from "@/app/shared/components/ui-kit/select/select.component";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { NotificationService } from "@/app/shared/services/core/notification.service";
import { SendTopicService } from "@/app/shared/services/topic/send-topic.service";
import { CropImagePopupComponent, CropImagePopupData } from "../../../ui/crop-image-popup/crop-image-popup.component";
import { LocationPickerComponent } from "../../../ui/topic-form/location-picker/location-picker.component";
import { TopicCoverEditorComponent } from "./topic-cover-editor.component";

@Component({
    selector: "app-topic-polish-review",
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputComponent,
        SelectComponent,
        TopicDescriptionComponent,
        PrimaryButtonComponent,
        ChipsInputComponent,
        TopicCoverEditorComponent,
        LocationPickerComponent,
        SvgIconComponent
    ],
    template: `
        <div class="header">
            <button class="back-btn" (click)="onBack()">
                <svg-icon src="assets/svg/arrow-back.svg" [svgStyle]="{ 'width.px': 24, 'height.px': 24 }"></svg-icon>
            </button>
            <div class="header-title">Created Topic Preview</div>
        </div>
        
        <div class="tabs">
            <button 
                class="tab-btn" 
                [class.active]="activeTab() === 'original'"
                (click)="switchTab('original')">
                Your Version
            </button>
            <button 
                class="tab-btn" 
                [class.active]="activeTab() === 'polished'"
                (click)="switchTab('polished')">
                Ai Polished
            </button>
        </div>

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

                <!-- Icon & Map -->
                <div class="section icon-section">
                    <div class="section-label">Choose Topic Icon</div>
                    <div class="icon-selection">
                        <ng-container *ngIf="activeTab() === 'polished'">
                            <div 
                                class="icon-option" 
                                [class.selected]="selectedIcon() === generatedPhotoIcon"
                                (click)="selectIcon(generatedPhotoIcon)"
                                *ngIf="generatedPhotoIcon">
                                <img [src]="generatedPhotoIcon" />
                                <div class="check-badge" *ngIf="selectedIcon() === generatedPhotoIcon">
                                    <svg-icon src="assets/svg/checked.svg" [svgStyle]="{ 'width.px': 10, 'height.px': 10 }"></svg-icon>
                                </div>
                            </div>
                            <div 
                                class="icon-option" 
                                [class.selected]="selectedIcon() === generatedSymbolicIcon"
                                (click)="selectIcon(generatedSymbolicIcon)"
                                *ngIf="generatedSymbolicIcon">
                                <img [src]="generatedSymbolicIcon" />
                                <div class="check-badge" *ngIf="selectedIcon() === generatedSymbolicIcon">
                                    <svg-icon src="assets/svg/checked.svg" [svgStyle]="{ 'width.px': 10, 'height.px': 10 }"></svg-icon>
                                </div>
                            </div>
                        </ng-container>

                         <!-- Upload Option -->
                         <div class="icon-option upload" (click)="uploadIcon()" [class.selected]="isCustomIcon()">
                            <img [src]="customIconUrl()" *ngIf="customIconUrl(); else uploadPlaceholder" class="custom-icon-img"/>
                            <ng-template #uploadPlaceholder>
                                <div class="upload-content">
                                    <svg-icon src="assets/svg/plus-circle.svg" [svgStyle]="{ 'width.px': 24, 'height.px': 24 }"></svg-icon>
                                </div>
                            </ng-template>
                         </div>
                    </div>
                     
                     <div class="map-toggle" [class.expanded]="isMapExpanded()" (click)="toggleMapPreview()">
                        <svg-icon src="assets/svg/map.svg" [svgStyle]="{ 'width.px': 16, 'height.px': 16 }" class="map-icon"></svg-icon> 
                        How it looks on the map 
                        <svg-icon src="assets/svg/chevron-down.svg" [svgStyle]="{ 'width.px': 16, 'height.px': 16 }" class="arrow"></svg-icon>
                    </div>
                    <div class="map-preview-container" [class.expanded]="isMapExpanded()">
                        <div class="map-placeholder">
                            <div class="map-pin">
                                <div class="map-pin-inner">
                                    <img [src]="selectedIcon()" *ngIf="selectedIcon()" />
                                </div>
                            </div>
                        </div>
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
                    <app-select
                        id="category"
                        name="category"
                        label="Category *"
                        formControlName="category"
                        [options]="(categoriesForForm | async) || []"
                    />
                </div>
                <div class="section">
                     <div class="audience-select">
                        <label>Audience</label>
                        <div class="fake-select">
                            <svg-icon src="assets/svg/globe.svg" [svgStyle]="{ 'width.px': 18, 'height.px': 18 }"></svg-icon>
                            Global
                            <svg-icon src="assets/svg/chevron-down.svg" [svgStyle]="{ 'width.px': 16, 'height.px': 16 }" class="arrow"></svg-icon>
                        </div>
                     </div>
                </div>
                
                <!-- <div class="section location-section">
                    <div class="section-label">Set your topic's starting location</div>
                    <p class="location-text">Your topic will appear here first. As the creator, your pulse will auto-renew daily for 7 days, keeping it on the map while others discover and spread it.</p>
                    <app-location-picker>
                        <app-input
                            autocomplete="off"
                            type="text"
                            id="location"
                            name="location"
                            iconEnd="starting-location"
                            formControlName="location"
                            placeholder="Select location"
                            (click)="saveStateBeforeNavigation()"
                        />
                    </app-location-picker>
                </div> -->

                <!-- Spacer -->
                <div style="height: 24px"></div>

                <app-primary-button
                    [fullWidth]="true"
                    (handleClick)="onSubmit()"
                >
                    Go to Preview
                </app-primary-button>
            </form>
        </div>
    `,
    styles: [`
        :host { display: block; max-width: 600px; margin: 0 auto; padding-bottom: 40px; }
        
        .header { display: flex; align-items: center; justify-content: center; margin-bottom: 24px; position: relative; }
        .back-btn { position: absolute; left: 0; background: none; border: none; cursor: pointer; color: var(--text-primary); display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; transition: background 0.2s; }
        .back-btn:hover { background: #f5f5f5; }
        .header-title { font-size: 18px; font-weight: 700; }

        /* Tabs */
        .tabs { display: flex; border-bottom: 2px solid #eee; margin-bottom: 24px; }
        .tab-btn { flex: 1; padding: 12px; font-weight: 600; color: #94a3b8; background: none; border: none; cursor: pointer; position: relative; transition: color 0.2s, background 0.2s; border-top-left-radius: 8px; border-top-right-radius: 8px; }
        .tab-btn:hover { background: #f8fafc; color: #64748b; }
        .tab-btn.active { color: var(--primary-color, #000); }
        .tab-btn.active::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 100%; height: 2px; background: var(--primary-color, #7029ff); }
        
        .card-container {
            background: #fff;
            border: 1px solid #eee;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        
        .section { margin-bottom: 24px; }
        .section-label { font-weight: 600; margin-bottom: 12px; color: var(--text-secondary); font-size: 14px; }
        
        /* Icon Selection */
        .icon-selection { display: flex; gap: 12px; margin-bottom: 16px; }
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
        .icon-option.selected { border-color: #000; box-shadow: 0 0 0 1px #000; }
        .icon-option img, .custom-icon-img { width: 100%; height: 100%; object-fit: cover; }
        .check-badge {
            position: absolute; top: 4px; right: 4px;
            background: #000; color: #fff;
            width: 16px; height: 16px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 10px;
        }
         ::ng-deep .check-badge svg-icon svg {
             fill: #fff;
        }
        
        /* Fancy Upload Icon */
        .icon-option.upload { 
            background: #fff; 
            border: 2px dashed #7029ff; /* Purple dashed */
            display: flex; 
            align-items: center; 
            justify-content: center; 
        }
        .icon-option.upload.selected {
             background: #f8f7fa;
        }
        .upload-content { display: flex; flex-direction: column; align-items: center; gap: 4px; color: #7029ff; }
         ::ng-deep .upload-content svg-icon svg {
             fill: #7029ff;
             stroke: #7029ff;
        }
        
        /* Map Preview */
        .map-toggle { font-size: 14px; font-weight: 600; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; gap: 6px; user-select: none; }
        .map-toggle .map-icon { color: var(--text-secondary); }
        .map-toggle .arrow { transition: transform 0.2s; margin-left: auto; color: var(--text-secondary); }
        .map-toggle.expanded .arrow { transform: rotate(180deg); }
        
        .map-preview-container {
            margin-top: 12px;
            height: 0;
            overflow: hidden;
            transition: height 0.3s ease;
            border-radius: 12px;
            background: #ecf0f3;
            position: relative;
            opacity: 0;
            transition: all 0.3s ease;
        }
        .map-preview-container.expanded { height: 180px; opacity: 1; }
        
        /* Simplified map placeholder */
        .map-placeholder {
            width: 100%; height: 100%;
            background-image: 
                linear-gradient(#fff 2px, transparent 2px),
                linear-gradient(90deg, #fff 2px, transparent 2px);
            background-size: 40px 40px;
            background-color: #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }
        .map-placeholder::after {
            content: '';
            position: absolute;
            width: 100px; height: 100px;
            background: rgba(255,255,255,0.4);
            border-radius: 50%;
            filter: blur(20px);
        }
        
        .map-pin {
            position: relative;
            z-index: 10;
            width: 48px; height: 48px;
            background: #fff;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            display: flex; align-items: center; justify-content: center;
            border: 2px solid #fff;
            animation: bounce 2s infinite;
        }
        .map-pin-inner {
            transform: rotate(45deg);
            width: 36px; height: 36px;
            overflow: hidden;
            border-radius: 50%;
            background: #f0f0f0;
        }
        .map-pin-inner img { width: 100%; height: 100%; object-fit: cover; }

        @keyframes bounce {
            0%, 100% { transform: translateY(0) rotate(-45deg); }
            50% { transform: translateY(-6px) rotate(-45deg); }
        }


        /* Fake Select */
        .audience-select label { display: block; font-weight: 500; margin-bottom: 8px; font-size: 14px; color: var(--text-secondary); }
        .fake-select {
            border: 1px solid #ddd; border-radius: 8px; padding: 10px 12px;
            display: flex; align-items: center; gap: 8px;
            color: #333; font-weight: 500;
            width: 100%; box-sizing: border-box;
        }
        .fake-select .arrow { margin-left: auto; color: #999; }
    `]
})
export class TopicPolishReviewComponent implements OnInit {
    @Input() set data(value: any) {
        if (value) {
            // Store versions
            this.versions.polished = {
                title: value.polishedTitle,
                description: value.polishedDescription,
                tags: value.tags || [],
                coverImage: value.coverImage,
                icon: value.symbolicIcon || value.photoIcon
            };
            this.versions.original = {
                title: value.title,
                description: value.description,
                tags: value.tags || [],
                coverImage: null,
                icon: null
            };

            // Setup shared assets
            if (value.photoIcon) this.generatedPhotoIcon = value.photoIcon;
            if (value.symbolicIcon) this.generatedSymbolicIcon = value.symbolicIcon;

            // Initial form set
            this.setFormToActiveTab();
        }
    }

    @Output() publish = new EventEmitter<any>();
    @Output() back = new EventEmitter<void>();
    @Output() regenerateCover = new EventEmitter<void>();

    public form = new FormGroup({
        title: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
        description: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
        tags: new FormControl<string[]>([], { nonNullable: true }),
        category: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
        location: new FormControl<string>('', { nonNullable: true }),
    });

    public activeTab = signal<'original' | 'polished'>('polished');
    public isMapExpanded = signal(false);

    private versions = {
        original: { title: '', description: '', tags: [] as string[], coverImage: null as string | null, icon: null as string | null },
        polished: { title: '', description: '', tags: [] as string[], coverImage: null as string | null, icon: null as string | null }
    };

    public selectedCoverImage = signal<string | null>(null);
    public finalCoverFile: File | string | null = null;

    public selectedIcon = signal<string | null>(null);
    public customIconUrl = signal<string | null>(null);
    public finalIconFile: File | string | null = null;

    public generatedPhotoIcon: string | null = null;
    public generatedSymbolicIcon: string | null = null;

    private dialog = inject(MatDialog);
    private notificationService = inject(NotificationService);
    private pulseService = inject(PulseService);
    private sendTopicService = inject(SendTopicService);

    public categoriesForForm = this.pulseService.categories$.pipe(
        map((categories) => categories.map((category) => category.name))
    );

    ngOnInit() {
        // Restore state from SendTopicService if returning from location picker
        const savedState = this.sendTopicService.tempTopicData;
        if (savedState) {
            // Restore form values
            this.form.patchValue({
                title: savedState.title || '',
                description: savedState.description || '',
                tags: savedState.tags || [],
                category: savedState.category || '',
                location: savedState.location || ''
            });

            // Restore generated images
            if (savedState.photoIcon) this.generatedPhotoIcon = savedState.photoIcon;
            if (savedState.symbolicIcon) this.generatedSymbolicIcon = savedState.symbolicIcon;
            if (savedState.coverImage) {
                this.versions.polished.coverImage = savedState.coverImage;
                this.versions.original.coverImage = savedState.coverImage;
            }

            // Restore selected icon
            if (savedState.selectedIcon) {
                this.selectedIcon.set(savedState.selectedIcon);
            }
        }
    }

    // Save current state before navigation (e.g., to location picker)
    saveStateBeforeNavigation() {
        const currentState = {
            ...this.form.getRawValue(),
            photoIcon: this.generatedPhotoIcon,
            symbolicIcon: this.generatedSymbolicIcon,
            coverImage: this.selectedCoverImage(),
            selectedIcon: this.selectedIcon()
        };
        this.sendTopicService.tempTopicData = currentState;
    }

    switchTab(tab: 'original' | 'polished') {
        if (this.activeTab() === tab) return;

        this.saveCurrentState();
        this.activeTab.set(tab);
        this.restoreStateForTab(tab);
    }

    private saveCurrentState() {
        const current = this.versions[this.activeTab()];
        const formVal = this.form.getRawValue();
        current.title = formVal.title;
        current.description = formVal.description;
        current.tags = formVal.tags;
        current.coverImage = this.selectedCoverImage();
        current.icon = this.selectedIcon();
    }

    private restoreStateForTab(tab: 'original' | 'polished') {
        const data = this.versions[tab];
        this.form.patchValue({
            title: data.title,
            description: data.description,
            tags: data.tags
        });
        this.selectedCoverImage.set(data.coverImage);
        this.selectedIcon.set(data.icon);
    }

    private setFormToActiveTab() {
        this.restoreStateForTab(this.activeTab());
    }

    toggleMapPreview() {
        this.isMapExpanded.update(v => !v);
    }

    selectIcon(icon: string | null) {
        this.selectedIcon.set(icon);
    }

    isCustomIcon(): boolean {
        // If selected icon is not one of the generated ones, assume custom
        const sel = this.selectedIcon();
        if (!sel) return false;
        return sel !== this.generatedPhotoIcon && sel !== this.generatedSymbolicIcon;
    }

    onCoverImageChange(fileOrUrl: File | string) {
        if (typeof fileOrUrl === 'string') {
            this.selectedCoverImage.set(fileOrUrl);
            this.finalCoverFile = fileOrUrl;
        } else {
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
            // Save current state first
            this.saveCurrentState();

            this.publish.emit({
                ...this.form.getRawValue(),
                icon: this.finalIconFile || this.selectedIcon(),
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
        const dialogRef = this.dialog.open<CropImagePopupComponent, CropImagePopupData>(
            CropImagePopupComponent,
            {
                width: "100%",
                maxWidth: "630px",
                panelClass: "custom-dialog-container",
                backdropClass: "custom-dialog-backdrop",
                data: {
                    file: file,
                    aspectRatio: 1,
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
