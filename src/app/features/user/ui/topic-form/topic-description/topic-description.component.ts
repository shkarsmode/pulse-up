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
import { map, Observable, of, startWith } from "rxjs";
import { SvgIconComponent } from "angular-svg-icon";
import { PickerComponent } from "@ctrl/ngx-emoji-mart";
import { TextareaComponent } from "../../../../../shared/components/ui-kit/textarea/textarea.component";
import { NotificationService } from "@/app/shared/services/core/notification.service";
import { TopicDescriptionCounterComponent } from "./topic-description-counter/topic-description-counter.component";
import { StringUtils } from "@/app/shared/helpers/string-utils";

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
    @Output() public handleBlur = new EventEmitter<void>();
    @Output() public handleFocus = new EventEmitter<void>();

    @ViewChild("descriptionInput") descriptionInput!: TextareaComponent;
    @ViewChild("descriptionPictures", { static: false }) public descriptionPictures: ElementRef;

    public readonly notificationService = inject(NotificationService);

    public isDescriptionFocused = false;
    public selectedPicture: string | ArrayBuffer | null;
    public selectedTypeOfPicture: "img" | "gif" | "smile" | "";
    public showEmojiPicker = false;
    public descriptionLength$: Observable<number> = of(0);

    public get hasErrorClass(): boolean {
        return !!(this.textControl?.touched && this.textControl?.invalid);
    }

    ngOnInit(): void {
        if (this.textControl) {
            this.descriptionLength$ = this.textControl.valueChanges.pipe(
                map((value) => (value ? StringUtils.toCRLF(value).length : 0)),
                startWith(this.textControl.value ? StringUtils.toCRLF(this.textControl.value).length : 0),
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
}
