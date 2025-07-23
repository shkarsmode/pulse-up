import { CloseButtonComponent } from "@/app/shared/components/ui-kit/buttons/close-button/close-button.component";
import { CopyButtonComponent } from "@/app/shared/components/ui-kit/buttons/copy-button/copy-button.component";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { QrcodeButtonComponent } from "@/app/shared/components/ui-kit/buttons/qrcode-button/qrcode-button.component";
import { SocialsButtonComponent } from "@/app/shared/components/ui-kit/buttons/socials-button/socials-button.component";
import { MenuComponent } from "@/app/shared/components/ui-kit/menu/menu.component";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { DialogService } from "@/app/shared/services/core/dialog.service";
import { Component, inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { delay, take } from "rxjs";
import { TopicQRCodePopupData } from "../../helpers/interfaces/topic-qrcode-popup-data.interface";
import { TopicQrcodePopupComponent } from "../topic-qrcode-popup/topic-qrcode-popup.component";

@Component({
    selector: "app-topic-published",
    standalone: true,
    imports: [
        CloseButtonComponent,
        PrimaryButtonComponent,
        MenuComponent,
        CopyButtonComponent,
        SocialsButtonComponent,
        QrcodeButtonComponent,
    ],
    templateUrl: "./topic-published.component.html",
    styleUrl: "./topic-published.component.scss",
})
export class TopicPublishedComponent {
    private readonly dialogRef = inject(MatDialogRef<TopicPublishedComponent>);
    private readonly dialogService = inject(DialogService);
    private readonly pulseService = inject(PulseService);
    private readonly settingsService = inject(SettingsService);
    private readonly data: { shareKey: string } = inject(MAT_DIALOG_DATA);
    link = this.settingsService.shareTopicBaseUrl + this.data.shareKey;
    copied = false;

    onCloseDialog(): void {
        this.dialogRef.close();
        this.pulseService.isJustCreatedTopic = false;
    }

    copyLink(): void {
        navigator.clipboard.writeText(this.link).then(() => {
            this.copied = true;
            setTimeout(() => {
                this.copied = false;
            }, 1500);
        });
    }

    onCopySocialLink(event: MouseEvent) {
        event.stopPropagation();
    }

    openQrCodePopup = (): void => {
        this.dialogRef.close();
        this.dialogRef
            .afterClosed()
            .pipe(take(1), delay(250))
            .subscribe(() => {
                this.dialogService.open<TopicQrcodePopupComponent, TopicQRCodePopupData>(
                    TopicQrcodePopupComponent,
                    {
                        data: {
                            link: this.link,
                            type: "topic",
                        },
                        width: "400px",
                    },
                );
            });
    }
}
