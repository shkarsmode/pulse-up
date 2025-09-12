import { Component, inject, Input } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { map } from "rxjs";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { ITopic, TopicState } from "@/app/shared/interfaces";
import { IVote } from "@/app/shared/interfaces/vote.interface";
import { VoteUtils } from "@/app/shared/helpers/vote-utils";
import { LargePulseComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse.component";
import { LargePulseIconComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-icon/large-pulse-icon.component";
import { LargePulseTitleComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-title/large-pulse-title.component";
import { LargePulseMetaComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-meta/large-pulse-meta.component";
import { LargePulseDescriptionComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-description/large-pulse-description.component";
import { LargePulseMetricComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-metric/large-pulse-metric.component";
import { FormatNumberPipe } from "@/app/shared/pipes/format-number.pipe";
import { AngularSvgIconModule } from "angular-svg-icon";
import { MenuComponent } from "@/app/shared/components/ui-kit/menu/menu.component";
import { CopyTopicButtonComponent } from "@/app/features/landing/ui/copy-topic-button/copy-topic-button.component";
import { SocialsButtonComponent } from "@/app/shared/components/ui-kit/buttons/socials-button/socials-button.component";
import { QrcodeButtonComponent } from "@/app/shared/components/ui-kit/buttons/qrcode-button/qrcode-button.component";
import { WaveAnimationDirective } from "@/app/shared/directives/wave-animation/wave-animation.directive";
import { PulseIconComponent } from "../../pulse-icon/pulse-icon.component";
import { PulseIconLabelComponent } from "@/app/shared/components/pulses/pulse-icon-label/pulse-icon-label.component";

@Component({
    selector: "app-my-topics-list-item",
    standalone: true,
    imports: [
        CommonModule,
        LargePulseComponent,
        LargePulseIconComponent,
        LargePulseTitleComponent,
        LargePulseMetaComponent,
        LargePulseDescriptionComponent,
        LargePulseMetricComponent,
        DatePipe,
        FormatNumberPipe,
        AngularSvgIconModule,
        MenuComponent,
        CopyTopicButtonComponent,
        SocialsButtonComponent,
        QrcodeButtonComponent,
        WaveAnimationDirective,
        PulseIconComponent,
        PulseIconLabelComponent,
    ],
    templateUrl: "./my-topics-list-item.component.html",
    styleUrl: "./my-topics-list-item.component.scss",
})
export class MyTopicsListItemComponent {
    private readonly settingsService = inject(SettingsService);

    @Input({ required: true }) data: ITopic;
    @Input() vote?: IVote | null = null;

    public topicUrl$ = this.settingsService.settings$.pipe(
        map((settings) => settings.shareTopicBaseUrl + this.data.shareKey),
    );

    public isVoteActive$ = this.settingsService.settings$.pipe(
        map(
            (settings) =>
                !!this.vote && VoteUtils.isActiveVote(this.vote, settings.minVoteInterval),
        ),
    );

    public get isArchived(): boolean {
        return this.data.state === TopicState.Archived;
    }

    public get qrCodePopupText(): string {
        return `Share the '${this.data.title}' topic with this QR code.`;
    }
}
