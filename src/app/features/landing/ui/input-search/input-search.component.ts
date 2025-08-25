import { Component, DestroyRef, EventEmitter, inject, Input, Output, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { InputComponent } from "@/app/shared/components/ui-kit/input/input.component";
import { CommonModule } from "@angular/common";
import { AngularSvgIconModule } from "angular-svg-icon";
import { MatButtonModule } from "@angular/material/button";
import { InputSearchService } from "./input-search.service";

@Component({
    selector: "app-input-search",
    templateUrl: "./input-search.component.html",
    styleUrl: "./input-search.component.scss",
    standalone: true,
    imports: [CommonModule, MatButtonModule, InputComponent, AngularSvgIconModule],
})
export class InputSearchComponent implements OnInit {
    @Input()
    public isLoading = false;

    @Output()
    public handleValueChange = new EventEmitter<string>();

    @Output()
    public handleFocus: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    public handleBlur: EventEmitter<void> = new EventEmitter<void>();

    private readonly destroyRef = inject(DestroyRef);
    private inputSearchService = inject(InputSearchService);

    public inputValue = this.inputSearchService.inputValue;

    ngOnInit() {
        this.inputSearchService.inputValueChanged$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((value) => {
                this.handleValueChange.emit(value);
            });
    }

    public onFocus(): void {
        this.handleFocus.emit();
    }

    public onBlur(): void {
        this.handleBlur.emit();
    }

    public clearInput(): void {
        this.inputSearchService.setValue("");
    }

    public handleInputChange(event: InputEvent): void {
        const value = (event.target as HTMLInputElement).value;
        this.inputSearchService.setValue(value);
    }
}
