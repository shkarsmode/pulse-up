import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import {
    ControlValueAccessor,
    FormsModule,
    NG_VALUE_ACCESSOR
} from '@angular/forms';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
    selector: 'app-chips-input',
    templateUrl: './chips-input.component.html',
    styleUrl: './chips-input.component.scss',
    standalone: true,
    imports: [CommonModule, FormsModule, SvgIconComponent],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ChipsInputComponent),
            multi: true,
        },
    ],
})
export class ChipsInputComponent implements ControlValueAccessor {
    @Input() limit: number = 5;

    chips: string[] = [];
    inputValue: string = '';

    public onChange: (value: string[]) => void = () => {};
    public onTouched: () => void = () => {};

    public writeValue(value: string[]): void {
        this.chips = value || [];
    }

    public registerOnChange(fn: (value: string[]) => void): void {
        this.onChange = fn;
    }

    public registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    public setDisabledState?(isDisabled: boolean): void {
        // Optionally: if you need to consider the disabled state
    }

    public addChip(event: KeyboardEvent): void {
        const input = event.target as HTMLInputElement;

        const sanitizeInput = (str: string): string => {
            const regex = /[^a-zA-Z0-9\s]/g;
            return str.replace(regex, '');
        };

        
        setTimeout(() => {
            input.value = sanitizeInput(this.inputValue);   
        });

        if (
            (event.key === 'Enter' || event.key === ',' || event.key === ';') &&
            this.inputValue.trim().length > 1 &&
            this.chips.length < this.limit
        ) { 
            const chip = sanitizeInput(this.inputValue.trim());
            if (!this.chips.includes(chip)) {
                this.chips.push(chip);
                this.onChange(this.chips);
            }
            this.inputValue = '';
            event.preventDefault();
        }

        if (event.key === 'Backspace' && this.inputValue === '') {
            this.chips.pop();
        }
    }

    public removeChip(index: number): void {
        this.chips.splice(index, 1);
        this.onChange(this.chips);
    }
}
