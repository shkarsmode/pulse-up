import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { InputComponent } from "@/app/shared/components/ui-kit/input/input.component";
import { PopupCloseButtonComponent } from "@/app/shared/components/ui-kit/popup/popup-close-button/popup-close-button.component";
import { PopupTextComponent } from "@/app/shared/components/ui-kit/popup/popup-text/popup-text.component";
import { PopupTitleComponent } from '@/app/shared/components/ui-kit/popup/popup-title/popup-title.component';
import { PopupLayoutComponent } from "@/app/shared/components/ui-kit/popup/popup.component";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";

@Component({
    selector: "app-report-topic",
    standalone: true,
    imports: [
        ReactiveFormsModule,
        PopupLayoutComponent,
        PopupTextComponent,
        MatFormFieldModule,
        PopupCloseButtonComponent,
        PrimaryButtonComponent,
        InputComponent,
        MatInputModule,
        PopupTitleComponent
    ],
    templateUrl: "./report-topic.component.html",
    styleUrl: "./report-topic.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportTopicComponent {
    public form = inject(FormBuilder).group({
        reason: ["", [Validators.required, Validators.minLength(5)]],
    });
    public dialogRef = inject(MatDialogRef<ReportTopicComponent>);

    public onSubmit(): void {
        if (this.form.invalid) return;

        const reason = this.form.get("reason")?.value;
        this.dialogRef.close(reason);
    }
}
