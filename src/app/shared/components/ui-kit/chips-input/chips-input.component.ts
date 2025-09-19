import { CommonModule } from "@angular/common";
import { Component, ElementRef, forwardRef, Input, ViewChild } from "@angular/core";
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from "@angular/forms";
import { SvgIconComponent } from "angular-svg-icon";
import { IconButtonComponent } from "../buttons/icon-button/icon-button.component";

@Component({
    selector: "app-chips-input",
    templateUrl: "./chips-input.component.html",
    styleUrl: "./chips-input.component.scss",
    standalone: true,
    imports: [CommonModule, FormsModule, SvgIconComponent, IconButtonComponent],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ChipsInputComponent),
            multi: true,
        },
    ],
})
export class ChipsInputComponent implements ControlValueAccessor {
    @Input() limit = 5;
    @Input() hasErrorClass = false;

    @ViewChild("chipsInput") chipsInput: ElementRef<HTMLInputElement>;

    chips: string[] = [];
    inputValue = "";

    get canAddChip(): boolean {
        return this.chips.length < this.limit && this.inputValue.trim().length > 0;
    }

    public onChange: (value: string[]) => void = () => false;
    public onTouched: () => void = () => false;

    public writeValue(value: string[]): void {
        this.chips = value || [];
    }

    public registerOnChange(fn: (value: string[]) => void): void {
        this.onChange = fn;
    }

    public registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    public setDisabledState?(): void {
        // Optionally: if you need to consider the disabled state
    }

    public addChip(event: KeyboardEvent): void {
        const input = event.target as HTMLInputElement;

        const sanitizeInput = (str: string): string => {
            const regex = /[^a-zA-Z0-9\s]/g;
            return str.replace(regex, "");
        };

        setTimeout(() => {
            input.value = sanitizeInput(this.inputValue);
        });

        if (
            (event.key === "Enter" || event.key === "," || event.key === ";") &&
            this.inputValue.trim().length > 0 &&
            this.chips.length < this.limit
        ) {
            const chip = sanitizeInput(this.inputValue.trim());
            if (!this.chips.includes(chip)) {
                this.chips.push(chip);
                this.onChange(this.chips);
                this.onTouched();
            }
            this.inputValue = "";
            event.preventDefault();
            this.chipsInput.nativeElement.focus();
        }

        if (event.key === "Backspace" && this.inputValue === "") {
            this.chips.pop();
            this.onTouched();
        }
    }

    public addChipWithButton(): void {
        const sanitizeInput = (str: string): string => {
            const regex = /[^a-zA-Z0-9\s]/g;
            return str.replace(regex, "");
        };

        if (this.inputValue.trim().length > 0 && this.chips.length < this.limit) {
            const chip = sanitizeInput(this.inputValue.trim());
            if (!this.chips.includes(chip)) {
                this.chips.push(chip);
                this.onChange(this.chips);
                this.onTouched();
            }
            this.inputValue = "";
            this.chipsInput.nativeElement.focus();
        }
    }

    public removeChip(index: number): void {
        this.chips.splice(index, 1);
        this.onChange(this.chips);
        this.onTouched();
        this.chipsInput.nativeElement.focus();
    }
}
