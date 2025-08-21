import { CloseButtonComponent } from "@/app/shared/components/ui-kit/buttons/close-button/close-button.component";
import { CopyButtonComponent } from "@/app/shared/components/ui-kit/buttons/copy-button/copy-button.component";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { QrcodeButtonComponent } from "@/app/shared/components/ui-kit/buttons/qrcode-button/qrcode-button.component";
import { SocialsButtonComponent } from "@/app/shared/components/ui-kit/buttons/socials-button/socials-button.component";
import { MenuComponent } from "@/app/shared/components/ui-kit/menu/menu.component";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { DialogService } from "@/app/shared/services/core/dialog.service";
import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { delay, map, Observable, take } from "rxjs";
import { TopicQRCodePopupData } from "../../interfaces/topic-qrcode-popup-data.interface";
import { TopicQrcodePopupComponent } from "../topic-qrcode-popup/topic-qrcode-popup.component";

@Component({
    selector: "app-topic-published",
    standalone: true,
    imports: [
        CommonModule,
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
export class TopicPublishedComponent implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
    private readonly dialogRef = inject(MatDialogRef<TopicPublishedComponent>);
    private readonly dialogService = inject(DialogService);
    private readonly pulseService = inject(PulseService);
    private readonly settingsService = inject(SettingsService);
    private readonly data: { shareKey: string } = inject(MAT_DIALOG_DATA);
    public link = "";
    public link$: Observable<string>;
    copied = false;

    ngOnInit(): void {
        this.link$ = this.settingsService.settings$.pipe(
            map((settings) => settings.shareTopicBaseUrl + this.data.shareKey),
        );
        this.link$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((link) => (this.link = link));
    }

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
    };
}
