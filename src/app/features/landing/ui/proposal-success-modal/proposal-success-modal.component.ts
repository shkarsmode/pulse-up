import { PopupCloseButtonComponent } from '@/app/shared/components/ui-kit/popup/popup-close-button/popup-close-button.component';
import { PopupLayoutComponent } from '@/app/shared/components/ui-kit/popup/popup.component';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-proposal-success-modal',
    standalone: true,
    imports: [
        CommonModule,
        PopupLayoutComponent,
        PopupCloseButtonComponent,
    ],
    templateUrl: './proposal-success-modal.component.html',
    styleUrl: './proposal-success-modal.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProposalSuccessModalComponent {
    public readonly dialogRef = inject(MatDialogRef<ProposalSuccessModalComponent>);

    public close(): void {
        this.dialogRef.close();
    }
}
