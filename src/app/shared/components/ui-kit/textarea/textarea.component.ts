import { CommonModule } from "@angular/common";
import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostBinding,
    Input,
    OnInit,
    Output,
    ViewChild,
} from "@angular/core";
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from "@angular/forms";

export const APP_UI_INPUT_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TextareaComponent),
    multi: true,
};

@Component({
    selector: "app-textarea",
    standalone: true,
    imports: [CommonModule, FormsModule],
    providers: [APP_UI_INPUT_ACCESSOR],
    templateUrl: "./textarea.component.html",
    styleUrl: "./textarea.component.scss",
})
export class TextareaComponent implements OnInit, AfterViewInit, ControlValueAccessor {
    @Input() public id: string;
    @Input() public name: string;
    @Input() public label = "";
    @Input() public hasErrorClass: boolean;
    @Input() public placeholder = "";
    @Input() public required = false;

    @Output() public emitBlur = new EventEmitter<any>();
    @Output() public emitFocus = new EventEmitter<any>();
    @Output() public onInput = new EventEmitter<any>();

    @ViewChild("textareaRef", { static: true }) public textareaRef: ElementRef;

    public isOnFocus: boolean;

    private readonly TEXTAREA_IN_FOCUS_CLASS = "app-ui-textarea--focus";
    private readonly TEXTAREA_HAS_VALUE_CLASS = "app-ui-textarea--has-value";
    private _value = "";

    disabled: boolean;
    onTouched: () => void;

    @HostBinding("attr.class")
    private get classes() {
        return [
            this.isOnFocus ? this.TEXTAREA_IN_FOCUS_CLASS : "",
            this.value?.length ? this.TEXTAREA_HAS_VALUE_CLASS : "",
        ]
            .filter(Boolean)
            .join(" ");
    }

    @Input()
    set value(val: any) {
        this._value = val ? val : "";
        this.onChange(this._value);
    }

    get value() {
        return this._value;
    }

    ngOnInit(): void {}

    ngAfterViewInit(): void {}

    public get nativeElement(): HTMLTextAreaElement {
        return this.textareaRef.nativeElement;
    }

    public onChange(val: string) {}

    public writeValue(value: string): void {
        this.value = value;
    }

    public registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    public registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    public setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}
