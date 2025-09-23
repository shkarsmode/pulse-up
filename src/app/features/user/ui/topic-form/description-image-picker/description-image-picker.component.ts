import {
    ChangeDetectionStrategy,
    Component,
    forwardRef,
    signal,
    OnDestroy,
    ViewChild,
    ElementRef,
    input,
    inject,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { Subscription, take } from "rxjs";
import {
    CropImagePopupComponent,
    CropImagePopupData,
} from "../../crop-image-popup/crop-image-popup.component";
import { CropResult } from "../../../interfaces/crop-result.interface";
import { NotificationService } from "@/app/shared/services/core/notification.service";
import { AngularSvgIconModule } from "angular-svg-icon";

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
    private subscription: Subscription;
    protected imgSrc = signal<string | null>(null);
    protected onChange: (value: File) => void = () => false;
    protected onTouched: () => void = () => false;
    public invalid = input(false);

    @ViewChild("fileInput", { static: true })
    protected fileInput!: ElementRef<HTMLInputElement>;

    ngOnDestroy() {
        this.revokeImageURL();
        this.subscription?.unsubscribe();
    }

    writeValue(file: File | null): void {
        this.imgSrc.set(file ? this.generateImageURL(file) : "");
        this.fileInput.nativeElement.value = "";
    }

    registerOnChange(fn: (value: File) => void): void {
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

    protected onImageSelected(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            const dialogRef = this.dialog.open<CropImagePopupComponent, CropImagePopupData>(
                CropImagePopupComponent,
                {
                    width: "100%",
                    maxWidth: "630px",
                    panelClass: "custom-dialog-container",
                    backdropClass: "custom-dialog-backdrop",
                    data: {
                        event: event,
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
    }

    private onCroppedImage = (result: CropResult) => {
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

    private revokeImageURL() {
        const imgSrc = this.imgSrc();
        if (imgSrc && imgSrc.startsWith("blob:")) {
            URL.revokeObjectURL(imgSrc);
            this.imgSrc.set(null);
        }
    }

    private generateImageURL(file: File): string {
        return URL.createObjectURL(file);
    }
}
