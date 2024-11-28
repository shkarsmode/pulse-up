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
} from '@angular/core';
import {
    ControlValueAccessor,
    FormsModule,
    NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { SvgIconComponent } from 'angular-svg-icon';
import { BehaviorSubject } from 'rxjs';
import { SpinnerComponent } from '../spinner/spinner.component';

export const APP_UI_INPUT_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SelectComponent),
    multi: true,
};

@Component({
    selector: 'app-select',
    standalone: true,
    imports: [FormsModule, SvgIconComponent, SpinnerComponent],
    providers: [APP_UI_INPUT_ACCESSOR],
    templateUrl: './select.component.html',
    styleUrl: './select.component.scss',
})
export class SelectComponent
    implements OnInit, AfterViewInit, ControlValueAccessor
{
    @Input() public id: string;
    @Input() public name: string;
    @Input() public svg: string;
    @Input() public min: number | string;
    @Input() public max: number | string;
    @Input() public label: string = '';
    @Input() public hasErrorClass: boolean;
    @Input() public placeholder: string = '';
    @Input() public required: boolean = false;
    @Input() public isLoading: boolean = false;
    @Input() public inputType: string = 'text';
    @Input() public autocomplete: string | boolean;
    @Input() public preventBrowserAutofill: boolean;

    @Output() public emitBlur: EventEmitter<any> = new EventEmitter();
    @Output() public emitFocus: EventEmitter<any> = new EventEmitter();
    @Output() public onInput: EventEmitter<any> = new EventEmitter();
    @Output() public emitAutofill: EventEmitter<any> = new EventEmitter();

    @ViewChild('selectRef', { static: true }) public selectRef: ElementRef;

    public isOnFocus: boolean;
    public isPasswordVisible: boolean;

    @Input() public options: Array<string> = [];
    @Input() public isShowInfo: boolean = false;
    @Input() public info: { title: string; description: string };

    private _autofillSubject: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false);
    public autofillObservable = this._autofillSubject.asObservable();
    public isSelectOpen: boolean = false;

    private readonly INPUT_IN_FOCUS_CLASS = 'app-ui-input--focus';
    private readonly INPUT_HAS_VALUE_CLASS = 'app-ui-input--has-value';
    private _value = '';
    private boundedFunction: (event: any) => void;

    disabled: boolean;
    onTouched: () => void;

    @HostBinding('attr.class')
    private get classes() {
        return [
            this.isOnFocus ? this.INPUT_IN_FOCUS_CLASS : '',
            this.value?.length ? this.INPUT_HAS_VALUE_CLASS : '',
        ]
            .filter(Boolean)
            .join(' ');
    }

    @Input()
    set value(val: any) {
        this._value = val ? val : '';
        this.onChange(this._value);
    }

    get value() {
        return this._value;
    }

    public ngOnInit(): void {
        // this.selectRef.nativeElement.addEventListener('focus', (event: Event) => {
        //     this.isSelectOpen = true;
        // });

        this.selectRef.nativeElement.addEventListener('blur', () => {
            this.isSelectOpen = false;
        });

        this.boundedFunction = this.handleOnOutsideClick.bind(this);

        document.addEventListener('click', this.boundedFunction);
    }

    private handleOnOutsideClick(event: any): void {
        if (event.target?.nodeName !== 'svg' && this.isShowInfo) {
            this.isShowInfo = false;
        }
    }
    public toggleOpenState(): void {
        setTimeout(() => {
            this.isSelectOpen = !this.isSelectOpen;
        }, 100);
    }

    public timerOfShowInfo: any;
    public onInputEvent(event: Event): void {
        this.onInput.emit(event);
        setTimeout(() => {
            this.isShowInfo = true;
        });
        clearTimeout(this.timerOfShowInfo);

        setTimeout(() => {
            this.isSelectOpen = false;
        }, 0);

        this.timerOfShowInfo = setTimeout(() => {
            this.isShowInfo = false;
        }, 1500);
    }

    public toggleInfoToolTip(): void {
        setTimeout(() => {
            this.isShowInfo = !this.isShowInfo;
        });
        clearTimeout(this.timerOfShowInfo);
    }

    public onInfoMouseOver(): void {
        this.isShowInfo = true;
        clearTimeout(this.timerOfShowInfo);
    }

    public onInfoMouseLeave(): void {
        this.isShowInfo = false;
        clearTimeout(this.timerOfShowInfo);
    }

    public ngAfterViewInit(): void {}

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

    public onAutoFill(event: any): void {
        this._autofillSubject.next(event.complete);
        this.emitAutofill.emit();
    }

    public ngOnDestroy(): void {
        document.removeEventListener('click', this.boundedFunction);
    }
}
