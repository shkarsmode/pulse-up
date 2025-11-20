import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { PopupCloseButtonComponent } from "@/app/shared/components/ui-kit/popup/popup-close-button/popup-close-button.component";
import { PopupTextComponent } from "@/app/shared/components/ui-kit/popup/popup-text/popup-text.component";
import { PopupTitleComponent } from "@/app/shared/components/ui-kit/popup/popup-title/popup-title.component";
import { PopupLayoutComponent } from "@/app/shared/components/ui-kit/popup/popup.component";
import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { REPORT_REASONS, ReportReasonNode } from "./report-topic.config";

@Component({
    selector: "app-report-topic",
    standalone: true,
    imports: [
        PopupLayoutComponent,
        PopupTitleComponent,
        PopupTextComponent,
        PopupCloseButtonComponent,
        PrimaryButtonComponent,
        MatFormFieldModule,
        MatInputModule,
    ],
    templateUrl: "./report-topic.component.html",
    styleUrl: "./report-topic.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportTopicComponent {
    private readonly dialogRef = inject(MatDialogRef<ReportTopicComponent>);

    public readonly reasonsTree: ReportReasonNode[] = REPORT_REASONS;

    public readonly navigationStack = signal<ReportReasonNode[]>([]);
    public readonly selectedLeaf = signal<ReportReasonNode | null>(null);
    public readonly customDescription = signal<string>("");

    public readonly isReviewStep = computed(() => this.selectedLeaf() !== null);

    public readonly currentNodes = computed(() => {
        if (this.isReviewStep()) {
            return [];
        }

        const stack = this.navigationStack();

        if (stack.length === 0) {
            return this.reasonsTree;
        }

        return stack[stack.length - 1].children ?? [];
    });

    public readonly currentTitle = computed(() => {
        if (this.isReviewStep()) {
            return "Review & Submit";
        }

        const stack = this.navigationStack();

        if (stack.length === 0) {
            return "Report Topic";
        }

        return stack[stack.length - 1].title;
    });

    public readonly rootReasonTitle = computed(() => {
        const stack = this.navigationStack();
        return stack.length > 0 ? stack[0].title : "";
    });

    public readonly isSubmitDisabled = computed(() => {
        const leaf = this.selectedLeaf();

        if (!leaf) {
            return true;
        }

        if (leaf.requiresText) {
            return this.customDescription().trim().length < 5;
        }

        return false;
    });

    public onNodeClick(node: ReportReasonNode): void {
        if (node.children && node.children.length > 0) {
            this.navigationStack.update((prev) => [...prev, node]);
            return;
        }

        this.selectedLeaf.set(node);
        this.customDescription.set("");
    }

    public onBack(): void {
        if (this.isReviewStep()) {
            this.selectedLeaf.set(null);
            this.customDescription.set("");
            return;
        }

        this.navigationStack.update((prev) => prev.slice(0, -1));
    }

    public onCancel(): void {
        this.dialogRef.close();
    }

    public onSubmit(): void {
        const leaf = this.selectedLeaf();
        if (!leaf) return;

        const reason = this.rootReasonTitle() || leaf.title;

        let description = leaf.title;

        if (leaf.requiresText) {
            description = this.customDescription().trim();
            if (description.length < 5) return;
        }

        this.dialogRef.close({ reason, description });
    }
}
