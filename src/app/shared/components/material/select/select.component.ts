import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatOption } from "@angular/material/core";
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
    selector: "app-select",
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormField,
        MatOption,
        MatLabel,
        MatSelectModule,
        MatFormFieldModule,
        AngularSvgIconModule,
    ],
    templateUrl: "./select.component.html",
    styleUrl: "./select.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent {
    @Input() control: FormControl<unknown>;
    @Input() options: { value: string; label: string }[];
    @Input() label: string;
    @Input() size: "small" | "medium" = "medium";
    @Input() accent = false;
    @Input() leftIconUrl: string | null = null;
}
