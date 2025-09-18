import { Component, computed, inject, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";
import { LargePulseComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse.component";
import { LargePulseIconComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-icon/large-pulse-icon.component";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { IVote } from "@/app/shared/interfaces/vote.interface";
import { ITopic, TopicState } from "@/app/shared/interfaces";
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
import { WaveAnimationDirective } from "@/app/shared/directives/wave-animation/wave-animation.directive";
import { PulseIconLabelComponent } from "@/app/shared/components/pulses/pulse-icon-label/pulse-icon-label.component";

@Component({
    selector: "app-user-topics-list-item",
    standalone: true,
    imports: [
        CommonModule,
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
        WaveAnimationDirective,
        PulseIconLabelComponent,
    ],
    templateUrl: "./user-topics-list-item.component.html",
    styleUrl: "./user-topics-list-item.component.scss",
})
export class UserTopicsListItemComponent {
    private readonly settingsService = inject(SettingsService);

    data = input<ITopic>();
    vote = input<IVote | null>(null);

    private shareTopicBaseUrl = toSignal(this.settingsService.settings$.pipe(
        map((settings) => settings.shareTopicBaseUrl),
    ), { initialValue: '' });
    private blobUrlPrefix = toSignal(this.settingsService.settings$.pipe(
        map((settings) => settings.blobUrlPrefix),
    ), { initialValue: '' });
    private minVoteInterval = toSignal(this.settingsService.settings$.pipe(
        map((settings) => settings.minVoteInterval),
    ), { initialValue: 1440 });
    private title = computed(() => this.data()?.title ?? '');
    private description = computed(() => this.data()?.description ?? '');
    private icon = computed(() => this.data()?.icon ?? '');
    private shareKey = computed(() => this.data()?.shareKey ?? '');

    public topicUrl = computed(() => {
        const shareKey = this.shareKey();
        const baseUrl = this.shareTopicBaseUrl();
        return shareKey ? `${baseUrl}${shareKey}` : "";
    })
    public isVoteActive = computed(() => {
        const vote = this.vote();
        const minVoteInterval = this.minVoteInterval();
        return !!vote && VoteUtils.isActiveVote(vote, minVoteInterval);
    })
    public qrCodePopupText = computed(() => {
        return `Share the "${this.title()}" topic with this QR code.`;
    });
    public qrCodeBannerTitle = this.title;
    public qrCodeBannerSubtitle = this.description;
    public qrCodeBannerIcon = computed(() => {
        return this.blobUrlPrefix() + this.icon();
    });
    public isArchived = computed(() => {
        return this.data()?.state === TopicState.Archived;
    });
}
