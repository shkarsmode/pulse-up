import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { AbstractControl } from "@angular/forms";
import { PickerComponent } from "@ctrl/ngx-emoji-mart";
import { TextareaComponent } from "../../../../../shared/components/ui-kit/textarea/textarea.component";
import { SvgIconComponent } from "angular-svg-icon";

@Component({
    selector: "app-topic-description",
    standalone: true,
    imports: [CommonModule, SvgIconComponent, PickerComponent, TextareaComponent],
    templateUrl: "./topic-description.component.html",
    styleUrl: "./topic-description.component.scss",
})
export class TopicDescriptionComponent implements OnInit {
    @Input() public textControl: AbstractControl | null = null;
    @Input() public pictureControl: AbstractControl | null = null;
    @Output() public handleBlur: EventEmitter<any> = new EventEmitter();
    @Output() public handleFocus: EventEmitter<any> = new EventEmitter();

    @ViewChild("descriptionInput", { static: false }) public descriptionInput: ElementRef;
    @ViewChild("descriptionPictures", { static: false }) public descriptionPictures: ElementRef;

    public isDescriptionFocused: boolean = false;
    public selectedPicture: string | ArrayBuffer | null;
    public selectedTypeOfPicture: "img" | "gif" | "smile" | "";
    public showEmojiPicker = false;

    public get hasErrorClass(): boolean {
        return (
            !!(this.pictureControl?.touched && this.pictureControl?.invalid) ||
            !!(this.textControl?.touched && this.textControl?.invalid)
        );
    }

    ngOnInit(): void {
        this.updateSelectedFile(this.pictureControl?.value || null);
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

    public toggleEmojiPicker() {
        this.showEmojiPicker = !this.showEmojiPicker;
    }

    public addEmoji(event: any) {
        const emoji = event.emoji.native;
        const currentValue = this.textControl?.value || "";
        this.textControl?.setValue(currentValue + emoji);
        this.descriptionInput.nativeElement.focus();
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
