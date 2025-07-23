import { Component, EventEmitter, Input, Output } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
    asyncScheduler,
    debounceTime,
    distinctUntilChanged,
    Subject,
    ThrottleConfig,
} from "rxjs";
import { InputComponent } from "@/app/shared/components/ui-kit/input/input.component";

@Component({
    selector: "app-input-search",
    templateUrl: "./input-search.component.html",
    styleUrl: "./input-search.component.scss",
    standalone: true,
    imports: [InputComponent],
})
export class InputSearchComponent {
    @Input()
    public isLoading: boolean = false;

    @Output()
    public handleValueChange: EventEmitter<string> = new EventEmitter();

    private readonly inputValueChanged$: Subject<string> = new Subject();
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

    private initThrottleInputValueChange(): void {
        if (this.inputValueChanged$.observers.length === 0)
            this.inputValueChanged$
                .pipe(
                    debounceTime(400, asyncScheduler),
                    distinctUntilChanged(),
                    takeUntilDestroyed(),
                )
                .subscribe(this.handleInputValue.bind(this));
    }

    private handleInputValue(value: string): void {
        this.handleValueChange.emit(value);
    }
}
