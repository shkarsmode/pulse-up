import { CommonModule } from "@angular/common";
import {
    Component,
    ElementRef,
    EventEmitter,
    Output,
    ViewChild,
    ChangeDetectionStrategy,
    input,
    signal,
    effect,
} from "@angular/core";

@Component({
    selector: "app-picture-picker",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./picture-picker.component.html",
    styleUrl: "./picture-picker.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PicturePickerComponent {
    public id = input("");
    public name = input("");
    public label = input("");
    public picture = input<File | null>(null);
    public previewUrl = input("");
    public invalid = input(false);

    @Output() public pictureSelected = new EventEmitter<Event>();
    @Output() public pictureDeleted = new EventEmitter<void>();

    @ViewChild("customIcon") public customIcon!: ElementRef<HTMLInputElement>;

    public selectedPicture = signal<string | ArrayBuffer | null>("");
    public selectedTypeOfPicture = signal<"img" | "gif" | "smile" | "">("");

    constructor() {
        effect(() => {
            this.selectedPicture.set(this.previewUrl());
        }, { allowSignalWrites: true });

        effect(() => {
            const file = this.picture();
            if (file) {
                this.updateSelectedFile(file);
            }
        });
    }

    public deleteChosenPicture(): void {
        this.selectedTypeOfPicture.set("");
        this.selectedPicture.set("");
        this.pictureSelected.emit();
    }

    public onFileSelected(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            this.pictureSelected.emit(event);
        }
    }

    public clearInputValue(): void {
        if (this.customIcon) {
            this.customIcon.nativeElement.value = "";
        }
    }

    private updateSelectedFile(file: File): void {
        const reader = new FileReader();
        reader.onload = () => {
            this.selectedPicture.set(reader.result);
            this.selectedTypeOfPicture.set(this.getSelectedTypeOfPicture());
        };
        reader.readAsDataURL(file);
    }

    private getSelectedTypeOfPicture(): "img" | "gif" | "smile" {
        const extension = this.getExtensionFromBase64(this.selectedPicture());
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
}
