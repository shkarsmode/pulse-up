import { Component, EventEmitter, Input, Output } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { asyncScheduler, debounceTime, distinctUntilChanged, Subject, ThrottleConfig } from "rxjs";
import { InputComponent } from "@/app/shared/components/ui-kit/input/input.component";
import { CommonModule } from "@angular/common";
import { AngularSvgIconModule } from "angular-svg-icon";
import { MatButtonModule } from "@angular/material/button";
import { StringUtils } from "@/app/shared/helpers/string-utils";

@Component({
    selector: "app-input-search",
    templateUrl: "./input-search.component.html",
    styleUrl: "./input-search.component.scss",
    standalone: true,
    imports: [CommonModule, MatButtonModule, InputComponent, AngularSvgIconModule],
})
export class InputSearchComponent {
    @Input()
    public isLoading = false;

    @Output()
    public handleValueChange = new EventEmitter<string>();

    @Output()
    public handleFocus: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    public handleBlur: EventEmitter<void> = new EventEmitter<void>();

    private readonly inputValueChanged$ = new Subject<string>();
    private readonly throttleConfig: ThrottleConfig = {
        leading: true,
        trailing: true,
    };

    constructor() {
        this.initThrottleInputValueChange();
    }

    public handleInputChange(event: InputEvent): void {
        this.inputValueChanged$.next((event.target as HTMLInputElement).value);
    }

    public onFocus(): void {
        this.handleFocus.emit();
    }

    public onBlur(): void {
        this.handleBlur.emit();
    }

    public clearInput(): void {
        this.inputValueChanged$.next("");
    }

    private initThrottleInputValueChange(): void {
        if (this.inputValueChanged$.observers.length === 0)
            this.inputValueChanged$
                .pipe(
                    debounceTime(400, asyncScheduler),
                    distinctUntilChanged((prev, curr) => {
                        return StringUtils.normalizeWhitespace(prev) === StringUtils.normalizeWhitespace(curr);
                    }),
                    takeUntilDestroyed(),
                )
                .subscribe(this.handleInputValue.bind(this));
    }

    private handleInputValue(value: string): void {
        this.handleValueChange.emit(StringUtils.normalizeWhitespace(value));
    }
}
