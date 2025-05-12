import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { asyncScheduler, Subject, ThrottleConfig, throttleTime } from 'rxjs';

@Component({
    selector: 'app-input-search',
    templateUrl: './input-search.component.html',
    styleUrl: './input-search.component.scss',
})
export class InputSearchComponent implements OnInit {
    @Input() 
    public isLoading: boolean = false;

    @Input() isAddIcon: boolean = true;

    @Output() 
    public handleValueChange: EventEmitter<string> =new EventEmitter();

    private readonly inputValueChanged$: Subject<string> = new Subject();
    private readonly throttleConfig: ThrottleConfig = {
        leading: true,
        trailing: true,
    };

    public ngOnInit(): void {
        this.initThrottleInputValueChange();
    }

    public handleInputChange(event: InputEvent): void {
        this.inputValueChanged$.next((event.target as HTMLInputElement).value);
    }

    private initThrottleInputValueChange(): void {
        if (this.inputValueChanged$.observers.length === 0)
            this.inputValueChanged$
                .pipe(throttleTime(800, asyncScheduler, this.throttleConfig))
                .subscribe(this.handleInputValue.bind(this));
    }

    private handleInputValue(value: string): void {
        this.handleValueChange.emit(value);
    }
}
