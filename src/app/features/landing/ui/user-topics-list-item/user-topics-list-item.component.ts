import { Component, inject, Input } from "@angular/core";
import { LargePulseComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse.component";
import { LargePulseIconComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-icon/large-pulse-icon.component";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { IVote } from "@/app/shared/interfaces/vote.interface";
import { ITopic } from "@/app/shared/interfaces";
import { VoteUtils } from "@/app/shared/helpers/vote-utils";
import { LargePulseTitleComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-title/large-pulse-title.component";
import { LargePulseDescriptionComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-description/large-pulse-description.component";
import { LargePulseMetricComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-metric/large-pulse-metric.component";
import { AngularSvgIconModule } from "angular-svg-icon";
import { MenuComponent } from "@/app/shared/components/ui-kit/menu/menu.component";
import { CopyTopicButtonComponent } from "../copy-topic-button/copy-topic-button.component";
import { SocialsButtonComponent } from "@/app/shared/components/ui-kit/buttons/socials-button/socials-button.component";
import { QrcodeButtonComponent } from "@/app/shared/components/ui-kit/buttons/qrcode-button/qrcode-button.component";
import { FormatNumberPipe } from "@/app/shared/pipes/format-number.pipe";

@Component({
    selector: "app-user-topics-list-item",
    standalone: true,
    imports: [
        LargePulseComponent,
        LargePulseIconComponent,
        LargePulseTitleComponent,
        LargePulseDescriptionComponent,
        LargePulseMetricComponent,
        AngularSvgIconModule,
        MenuComponent,
        CopyTopicButtonComponent,
        SocialsButtonComponent,
        QrcodeButtonComponent,
        FormatNumberPipe,
    ],
    templateUrl: "./user-topics-list-item.component.html",
    styleUrl: "./user-topics-list-item.component.scss",
})
export class UserTopicsListItemComponent {
    private readonly settingsService = inject(SettingsService);

    @Input({ required: true }) data: ITopic;
    @Input() vote?: IVote | null = null;

    public get topicUrl() {
        return this.settingsService.shareTopicBaseUrl + this.data.shareKey;
    }
    public get isVoteActive() {
        return (
            !!this.vote && VoteUtils.isActiveVote(this.vote, this.settingsService.minVoteInterval)
        );
    }
}
