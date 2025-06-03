import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { TextareaComponent } from "../../../../../shared/components/ui-kit/textarea/textarea.component";
import { SvgIconComponent } from "angular-svg-icon";
import { AbstractControl } from "@angular/forms";
import { CommonModule } from "@angular/common";

@Component({
    selector: "app-topic-description",
    standalone: true,
    imports: [CommonModule, SvgIconComponent, TextareaComponent],
    templateUrl: "./topic-description.component.html",
    styleUrl: "./topic-description.component.scss",
})
export class TopicDescriptionComponent {
    @Input() public textControl: AbstractControl | null = null;
    @Input() public pictureControl: AbstractControl | null = null;
    @Output() public handleBlur: EventEmitter<any> = new EventEmitter();
    @Output() public handleFocus: EventEmitter<any> = new EventEmitter();

    @ViewChild("descriptionPictures", { static: false }) public descriptionPictures: ElementRef;

    public isDescriptionFocused: boolean = false;
    public selectedPicture: string | ArrayBuffer | null;
    public selectedTypeOfPicture: "img" | "gif" | "smile" | "";

    public get hasErrorClass(): boolean {
        return (
            !!(this.pictureControl?.touched && this.pictureControl?.invalid) ||
            !!(this.textControl?.touched && this.textControl?.invalid)
        );
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
        const inputElement = this.descriptionPictures.nativeElement;

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
        this.pictureControl?.setValue(file);
        this.updateSelectedFile(file || null);
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
