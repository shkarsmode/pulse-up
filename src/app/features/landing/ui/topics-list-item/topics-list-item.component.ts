import { Component, inject, Input } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";
import { MatButtonModule } from "@angular/material/button";
import { LargePulseComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse.component";
import { LargePulseIconComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-icon/large-pulse-icon.component";
import { FormatNumberPipe } from "@/app/shared/pipes/format-number.pipe";
import { ITopic } from "@/app/shared/interfaces";
import { LargePulseTitleComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-title/large-pulse-title.component";
import { LargePulseDescriptionComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-description/large-pulse-description.component";
import { LargePulseMetaComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-meta/large-pulse-meta.component";
import { LargePulseMetricComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-metric/large-pulse-metric.component";
import { MenuComponent } from "@/app/shared/components/ui-kit/menu/menu.component";
import { SocialsButtonComponent } from "@/app/shared/components/ui-kit/buttons/socials-button/socials-button.component";
import { QrcodeButtonComponent } from "@/app/shared/components/ui-kit/buttons/qrcode-button/qrcode-button.component";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { DialogService } from "@/app/shared/services/core/dialog.service";
import { TopicQrcodePopupComponent } from "../topic-qrcode-popup/topic-qrcode-popup.component";
import { TopicQRCodePopupData } from "../../helpers/interfaces/topic-qrcode-popup-data.interface";
import { CopyTopicButtonComponent } from "../copy-topic-button/copy-topic-button.component";

@Component({
    selector: "app-topics-list-item",
    standalone: true,
    imports: [
        LargePulseComponent,
        LargePulseIconComponent,
        FormatNumberPipe,
        LargePulseTitleComponent,
        LargePulseDescriptionComponent,
        LargePulseMetaComponent,
        LargePulseMetricComponent,
        AngularSvgIconModule,
        MatButtonModule,
        MenuComponent,
        SocialsButtonComponent,
        QrcodeButtonComponent,
        CopyTopicButtonComponent,
    ],
    templateUrl: "./topics-list-item.component.html",
    styleUrl: "./topics-list-item.component.scss",
})
export class TopicsListItemComponent {
    private readonly dialogService = inject(DialogService);
    private readonly settingsService = inject(SettingsService);

    @Input({ required: true }) data: ITopic;

    public get topicUrl() {
        return this.settingsService.shareTopicBaseUrl + this.data.shareKey;
    }

    public openQrCodePopup = (): void => {
        this.dialogService.open<TopicQrcodePopupComponent, TopicQRCodePopupData>(
            TopicQrcodePopupComponent,
            {
                width: "400px",
                data: {
                    link: this.topicUrl,
                    type: "topic",
                },
            },
        );
    };
}
