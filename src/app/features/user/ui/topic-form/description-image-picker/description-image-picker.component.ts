import { NotificationService } from "@/app/shared/services/core/notification.service";
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    forwardRef,
    inject,
    input,
    OnDestroy,
    signal,
    ViewChild,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { AngularSvgIconModule } from "angular-svg-icon";
import { Subscription, take } from "rxjs";
import { CropResult } from "../../../interfaces/crop-result.interface";
import {
    CropImagePopupComponent,
    CropImagePopupData,
} from "../../crop-image-popup/crop-image-popup.component";

@Component({
    selector: "app-description-image-picker",
    standalone: true,
    templateUrl: "./description-image-picker.component.html",
    styleUrl: "./description-image-picker.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DescriptionImagePickerComponent),
            multi: true,
        },
    ],
    imports: [AngularSvgIconModule],
})
export class DescriptionImagePickerComponent implements OnDestroy, ControlValueAccessor {
    private dialog = inject(MatDialog);
    public notificationService = inject(NotificationService);

    private subscription: Subscription | undefined;

    protected imgSrc = signal<string | null>(null);
    protected onChange: (value: File | string | null) => void = () => false;
    protected onTouched: () => void = () => false;

    public invalid = input(false);

    @ViewChild("fileInput", { static: true })
    protected fileInput!: ElementRef<HTMLInputElement>;

    ngOnDestroy(): void {
        this.revokeImageURL();
        this.subscription?.unsubscribe();
    }

    writeValue(value: File | string | null): void {
        this.revokeImageURL();

        if (!value) {
            this.imgSrc.set(null);
            if (this.fileInput?.nativeElement) {
                this.fileInput.nativeElement.value = "";
            }
            return;
        }

        // Backend already stored image path or URL
        if (typeof value === "string") {
            this.imgSrc.set(value);
            if (this.fileInput?.nativeElement) {
                this.fileInput.nativeElement.value = "";
            }
            return;
        }

        // New file selected by user
        this.imgSrc.set(this.generateImageURL(value));
        if (this.fileInput?.nativeElement) {
            this.fileInput.nativeElement.value = "";
        }
    }

    registerOnChange(fn: (value: File | string | null) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        if (this.fileInput && this.fileInput.nativeElement) {
            this.fileInput.nativeElement.disabled = isDisabled;
        }
    }

    protected onImageSelected(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
            return;
        }

        const dialogRef = this.dialog.open<CropImagePopupComponent, CropImagePopupData>(
            CropImagePopupComponent,
            {
                width: "100%",
                maxWidth: "630px",
                panelClass: "custom-dialog-container",
                backdropClass: "custom-dialog-backdrop",
                data: {
                    file: file,
                    aspectRatio: 3 / 4,
                    maintainAspectRatio: false,
                },
            },
        );

        this.subscription = dialogRef
            .afterClosed()
            .pipe(take(1))
            .subscribe((result) => this.onCroppedImage(result));
    }


    private onCroppedImage = (result: CropResult): void => {
        if (result.success) {
            if (result.imageFile) {
                this.revokeImageURL();
                this.imgSrc.set(this.generateImageURL(result.imageFile));
                this.onChange?.(result.imageFile);
                this.fileInput.nativeElement.value = "";
            }
        } else if (result.message) {
            this.notificationService.error(result.message);
        }
    };

    private revokeImageURL(): void {
        const currentImgSrc = this.imgSrc();
        if (currentImgSrc && currentImgSrc.startsWith("blob:")) {
            URL.revokeObjectURL(currentImgSrc);
            this.imgSrc.set(null);
        }
    }

    private generateImageURL(file: File): string {
        return URL.createObjectURL(file);
    }
}
