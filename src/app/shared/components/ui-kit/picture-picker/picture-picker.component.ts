import { CommonModule } from "@angular/common";
import {
    ChangeDetectionStrategy,
    Component,
    effect,
    ElementRef,
    EventEmitter,
    input,
    Output,
    signal,
    ViewChild,
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

    // Теперь допускаем и File, и string, и null
    public picture = input<File | string | null>(null);

    // Можешь дальше использовать previewUrl, если где-то отдельно пробрасываешь
    public previewUrl = input<string | null>(null);

    public invalid = input(false);

    @Output() public pictureSelected = new EventEmitter<Event>();
    @Output() public pictureDeleted = new EventEmitter<void>();

    @ViewChild("customIcon") public customIcon!: ElementRef<HTMLInputElement>;

    public selectedPicture = signal<string | ArrayBuffer | null>("");
    public selectedTypeOfPicture = signal<"img" | "gif" | "smile" | "">("");

    constructor() {
        // Если извне дали отдельный previewUrl — используем его
        effect(
            () => {
                const preview = this.previewUrl();
                if (preview) {
                    this.selectedPicture.set(preview);
                    this.selectedTypeOfPicture.set(this.getSelectedTypeOfPicture());
                }
            },
            { allowSignalWrites: true },
        );

        // Реагируем на изменение picture (File | string | null)
        effect(
            () => {
                const value = this.picture();

                if (!value) {
                    // Nothing selected
                    this.selectedPicture.set("");
                    this.selectedTypeOfPicture.set("");
                    return;
                }

                if (value instanceof File) {
                    // Новый файл от пользователя
                    this.updateSelectedFile(value);
                    return;
                }

                if (typeof value === "string") {
                    // Уже сохранённый путь/URL с бэка
                    this.selectedPicture.set(value);
                    this.selectedTypeOfPicture.set(this.getSelectedTypeOfPicture());
                }
            },
            { allowSignalWrites: true },
        );
    }

    public deleteChosenPicture(): void {
        this.selectedTypeOfPicture.set("");
        this.selectedPicture.set("");
        this.pictureDeleted.emit();
        if (this.customIcon) {
            this.customIcon.nativeElement.value = "";
        }
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
