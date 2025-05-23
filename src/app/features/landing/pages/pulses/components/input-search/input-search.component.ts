import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { RouterLink } from "@angular/router";
import { SvgIconComponent } from "angular-svg-icon";
import { asyncScheduler, Subject, ThrottleConfig, throttleTime } from "rxjs";
import { InputComponent } from "@/app/shared/components/ui-kit/input/input.component";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";

@Component({
    selector: "app-input-search",
    templateUrl: "./input-search.component.html",
    styleUrl: "./input-search.component.scss",
    standalone: true,
    imports: [InputComponent, SvgIconComponent, RouterLink],
})
export class InputSearchComponent implements OnInit {
    @Input()
    public isLoading: boolean = false;

    @Input() isAddIcon: boolean = true;

    @Output()
    public handleValueChange: EventEmitter<string> = new EventEmitter();
    public appRoutes = AppRoutes

    private readonly inputValueChanged$: Subject<string> = new Subject();
    private readonly throttleConfig: ThrottleConfig = {
        leading: true,
        trailing: true,
    };

    public get addTopicRoute(): string {
        return `/${this.appRoutes.User.Topic.SUGGEST}`;
    }

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
