import {
    Component,
    ElementRef,
    EventEmitter,
    inject,
    Input,
    OnInit,
    Output,
    ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { AbstractControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { map, Observable, of, take } from "rxjs";
import { SvgIconComponent } from "angular-svg-icon";
import { PickerComponent } from "@ctrl/ngx-emoji-mart";
import { TextareaComponent } from "../../../../../shared/components/ui-kit/textarea/textarea.component";
import {
    CropImagePopupComponent,
    CropImagePopupData,
} from "../../crop-image-popup/crop-image-popup.component";
import { CropResult } from "../../../interfaces/crop-result.interface";
import { NotificationService } from "@/app/shared/services/core/notification.service";
import { TopicDescriptionCounterComponent } from "./topic-description-counter/topic-description-counter.component";

@Component({
    selector: "app-topic-description",
    standalone: true,
    imports: [
        CommonModule,
        SvgIconComponent,
        PickerComponent,
        TextareaComponent,
        TopicDescriptionCounterComponent,
    ],
    templateUrl: "./topic-description.component.html",
    styleUrl: "./topic-description.component.scss",
})
export class TopicDescriptionComponent implements OnInit {
    @Input() public textControl: AbstractControl<string, string> | null = null;
    @Input() public pictureControl: AbstractControl | null = null;
    @Output() public handleBlur = new EventEmitter<void>();
    @Output() public handleFocus = new EventEmitter<void>();

    @ViewChild("descriptionInput") descriptionInput!: TextareaComponent;
    @ViewChild("descriptionPictures", { static: false }) public descriptionPictures: ElementRef;

    private readonly dialog = inject(MatDialog);
    public readonly notificationService = inject(NotificationService);

    public isDescriptionFocused = false;
    public selectedPicture: string | ArrayBuffer | null;
    public selectedTypeOfPicture: "img" | "gif" | "smile" | "";
    public showEmojiPicker = false;
    public descriptionLength$: Observable<number> = of(0);

    public get hasErrorClass(): boolean {
        return (
            !!(this.pictureControl?.touched && this.pictureControl?.invalid) ||
            !!(this.textControl?.touched && this.textControl?.invalid)
        );
    }

    ngOnInit(): void {
        this.updateSelectedFile(this.pictureControl?.value || null);
        if (this.textControl) {
            this.descriptionLength$ = this.textControl.valueChanges.pipe(
                map((value) => (value ? value.length : 0)),
            );
        }
    }

    public onFocus(): void {
        this.isDescriptionFocused = true;
        this.handleFocus.emit();
    }

    public onBlur(): void {
        this.isDescriptionFocused = false;
        this.handleBlur.emit();
    }

    public openInputForDescription(acceptType: "img" | "gif" | "smile"): void {
        const inputElement = this.descriptionPictures.nativeElement as HTMLInputElement;
        inputElement.files = null;
        inputElement.value = "";

        const acceptTypeKeyMap = {
            img: ".png, .jpg, .jpeg",
            gif: ".gif",
            smile: ".svg",
        };

        inputElement.setAttribute("accept", acceptTypeKeyMap[acceptType]);
        inputElement.click();
    }

    public deleteChosenPicture(): void {
        this.pictureControl?.setValue("");
        this.selectedTypeOfPicture = "";
        this.selectedPicture = "";
    }

    public onFileSelected(event: Event): void {
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
            dialogRef
                .afterClosed()
                .pipe(take(1))
                .subscribe((result) => this.onCroppedImage(result));
        }
    }

    public updateSelectedFile(file: File | null): void {
        if (file) {
            const reader = new FileReader();

            reader.onload = () => {
                this.selectedPicture = reader.result;
                this.selectedTypeOfPicture = this.getSelectedTypeOfPicture();
            };
            reader.readAsDataURL(file);
        }
    }

    public handleInput(event: Event): void {
        this.textControl?.setValue((event.target as HTMLTextAreaElement).value);
    }

    public toggleEmojiPicker() {
        this.showEmojiPicker = !this.showEmojiPicker;
    }

    public addEmoji(event: unknown) {
        if (
            event &&
            typeof event === "object" &&
            "emoji" in event &&
            event.emoji &&
            typeof event.emoji === "object" &&
            "native" in event.emoji
        ) {
            const emoji = event.emoji.native;
            const currentValue = this.textControl?.value || "";
            this.textControl?.setValue(currentValue + emoji);
            this.descriptionInput.nativeElement.focus();
        }
    }

    private getSelectedTypeOfPicture(): "img" | "gif" | "smile" {
        const extension = this.getExtensionFromBase64(this.selectedPicture);
        switch (extension) {
            case "png":
            case "jpeg":
            case "jpg":
                return "img";
            case "gif":
                return "gif";
            default:
                return "smile";
        }
    }

    private getExtensionFromBase64(dataUrl: unknown): string | null {
        if (typeof dataUrl !== "string") {
            return null;
        }
        const match = dataUrl.match(/^data:(.+?);base64,/);
        if (match) {
            const mimeType = match[1];
            return mimeType.split("/")[1];
        }
        return null;
    }

    private onCroppedImage = (result: CropResult) => {
        if (result.success) {
            this.pictureControl?.setValue(result.imageFile);
            this.updateSelectedFile(result.imageFile);
        } else if (result.message) {
            this.notificationService.error(result.message);
        }
    };
}
