import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { AbstractControl } from "@angular/forms";

@Component({
    selector: "app-picture-picker",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./picture-picker.component.html",
    styleUrl: "./picture-picker.component.scss",
})
export class PicturePickerComponent {
    @Input() public id: string = "";
    @Input() public name: string = "";
    @Input() public label: string = "";
    @Input() public picture: File | null = null;
    @Input() public previewUrl: string = "";
    @Input() public invalid: boolean = false;

    @Output() public pictureSelected = new EventEmitter<Event>();
    @Output() public pictureDeleted = new EventEmitter<void>();

    public selectedPicture: string | ArrayBuffer | null;
    public selectedTypeOfPicture: "img" | "gif" | "smile" | "";

    ngOnInit(): void {
        this.selectedPicture = this.previewUrl;
        if (this.picture) {
            this.updateSelectedFile(this.picture);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes["picture"]?.currentValue) {
          this.updateSelectedFile(changes["picture"].currentValue);
        }
    }

    public deleteChosenPicture(): void {
        this.selectedTypeOfPicture = "";
        this.selectedPicture = "";
        this.pictureSelected.emit();
    }

    public onFileSelected(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            this.pictureSelected.emit(event);
        }
    }

    private updateSelectedFile(file: File): void {
        const reader = new FileReader();
        reader.onload = () => {
            this.selectedPicture = reader.result;
            this.selectedTypeOfPicture = this.getSelectedTypeOfPicture();
        };
        reader.readAsDataURL(file);
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

    private getExtensionFromBase64(dataUrl: any): string | null {
        const match = dataUrl.toString().match(/^data:(.+?);base64,/);
        if (match) {
            const mimeType = match[1];
            return mimeType.split("/")[1];
        }
        return null;
    }
}
