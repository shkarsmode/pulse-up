import {
    ChangeDetectionStrategy,
    Component,
    Input,
    signal,
    OnChanges,
    Output,
    EventEmitter,
} from "@angular/core";
import { MatButtonToggleChange, MatButtonToggleModule } from "@angular/material/button-toggle";

@Component({
    selector: "app-button-toggle",
    standalone: true,
    imports: [MatButtonToggleModule],
    templateUrl: "./button-toggle.component.html",
    styleUrl: "./button-toggle.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonToggleComponent implements OnChanges {
    @Input() name = "";
    @Input() options: { value: string; label: string }[] = [];
    @Output() changed = new EventEmitter<string>();

    public selectedValue = signal("");

    public ngOnChanges() {
        if (this.options.length > 0 && !this.selectedValue()) {
            this.selectedValue.set(this.options[0].value);
        }
    }

    public handleChange({ value }: MatButtonToggleChange) {
        this.selectedValue.set(value);
        this.changed.emit(value);
    }
}
