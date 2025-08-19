import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatOption } from "@angular/material/core";

@Component({
    selector: "app-select",
    standalone: true,
    imports: [ReactiveFormsModule, MatFormField, MatOption, MatLabel, MatSelectModule, MatFormFieldModule],
    templateUrl: "./select.component.html",
    styleUrl: "./select.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent {
    @Input() control: FormControl<unknown>;
    @Input() options: { value: string; label: string }[];
    @Input() label: string;
}
