import { Component, inject } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { CloseButtonComponent } from "../../ui-kit/buttons/close-button/close-button.component";
import { PrimaryButtonComponent } from "../../ui-kit/buttons/primary-button/primary-button.component";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { MenuComponent } from "../../ui-kit/menu/menu.component";
import { CopyButtonComponent } from "../../ui-kit/buttons/copy-button/copy-button.component";
import { SocialsButtonComponent } from "../../ui-kit/buttons/socials-button/socials-button.component";

@Component({
    selector: "app-topic-published",
    standalone: true,
    imports: [
        CloseButtonComponent,
        PrimaryButtonComponent,
        MenuComponent,
        CopyButtonComponent,
        SocialsButtonComponent,
    ],
    templateUrl: "./topic-published.component.html",
    styleUrl: "./topic-published.component.scss",
})
export class TopicPublishedComponent {
    private readonly dialogRef: MatDialogRef<TopicPublishedComponent> = inject(MatDialogRef);
    private readonly pulseService: PulseService = inject(PulseService);
    private readonly settingsService: SettingsService = inject(SettingsService);
    private readonly data: { shareKey: string } = inject(MAT_DIALOG_DATA);
    link = this.settingsService.shareTopicBaseUrl + this.data.shareKey;
    copied = false;

    public onCloseDialog(): void {
        this.dialogRef.close();
        this.pulseService.isJustCreatedTopic = false;
    }

    public copyLink(): void {
        navigator.clipboard.writeText(this.link).then(() => {
            this.copied = true;
            setTimeout(() => {
                this.copied = false;
            }, 1500);
        });
    }

    public onCopySocialLink(event: MouseEvent) {
        event.stopPropagation();
    }
}
