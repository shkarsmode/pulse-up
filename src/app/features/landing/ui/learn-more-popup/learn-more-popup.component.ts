import { PrimaryButtonComponent } from '@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component';
import { PopupCloseButtonComponent } from '@/app/shared/components/ui-kit/popup/popup-close-button/popup-close-button.component';
import { PopupFooterComponent } from '@/app/shared/components/ui-kit/popup/popup-footer/popup-footer.component';
import { PopupTitleComponent } from '@/app/shared/components/ui-kit/popup/popup-title/popup-title.component';
import { PopupLayoutComponent } from '@/app/shared/components/ui-kit/popup/popup.component';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-learn-more-popup',
    standalone: true,
    imports: [
        PopupTitleComponent,
        PopupFooterComponent,
        PopupLayoutComponent,
        PopupCloseButtonComponent,
        PrimaryButtonComponent
    ],
    templateUrl: './learn-more-popup.component.html',
    styleUrl: './learn-more-popup.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LearnMorePopupComponent {
    private readonly dialogRef = inject(MatDialogRef<LearnMorePopupComponent>);

    public onClose() {
        this.dialogRef.close();
    }

}
