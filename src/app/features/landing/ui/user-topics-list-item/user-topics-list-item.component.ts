import { Component, computed, inject, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";
import { LargePulseComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse.component";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { IVote } from "@/app/shared/interfaces/vote.interface";
import { ITopic, TopicState } from "@/app/shared/interfaces";
import { VoteUtils } from "@/app/shared/helpers/vote-utils";
import { LargePulseTitleComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-title/large-pulse-title.component";
import { LargePulseMetricComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-metric/large-pulse-metric.component";
import { AngularSvgIconModule } from "angular-svg-icon";
import { CopyTopicButtonComponent } from "../copy-topic-button/copy-topic-button.component";
import { SocialsButtonComponent } from "@/app/shared/components/ui-kit/buttons/socials-button/socials-button.component";
import { QrcodeButtonComponent } from "@/app/shared/components/ui-kit/buttons/qrcode-button/qrcode-button.component";
import { FormatNumberPipe } from "@/app/shared/pipes/format-number.pipe";
import { WaveAnimationDirective } from "@/app/shared/directives/wave-animation/wave-animation.directive";
import { LargePulseMetaComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-meta/large-pulse-meta.component";
import { LargePulsePictureComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-picture/large-pulse-picture.component";
import { TopicShareMenuComponent } from "../topic-share-menu/topic-share-menu.component";
import { LargePulseVoteButtonComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-vote-button/large-pulse-vote-button.component";
import { TopicUtils } from "@/app/shared/helpers/topic-utils";
import { LargePulseExpirationIndicatorComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-expiration-indicator/large-pulse-expiration-indicator.component";

@Component({
    selector: "app-user-topics-list-item",
    standalone: true,
    imports: [
        CommonModule,
        LargePulseComponent,
        LargePulseTitleComponent,
        LargePulseMetricComponent,
        AngularSvgIconModule,
        CopyTopicButtonComponent,
        SocialsButtonComponent,
        QrcodeButtonComponent,
        FormatNumberPipe,
        WaveAnimationDirective,
        LargePulseMetaComponent,
        LargePulsePictureComponent,
        TopicShareMenuComponent,
        LargePulseVoteButtonComponent,
        LargePulseExpirationIndicatorComponent,
    ],
    templateUrl: "./user-topics-list-item.component.html",
    styleUrl: "./user-topics-list-item.component.scss",
})
export class UserTopicsListItemComponent {
    private readonly settingsService = inject(SettingsService);

    data = input<ITopic>();
    vote = input<IVote | null>(null);

    private shareTopicBaseUrl = toSignal(
        this.settingsService.settings$.pipe(map((settings) => settings.shareTopicBaseUrl)),
        { initialValue: "" },
    );
    private blobUrlPrefix = toSignal(
        this.settingsService.settings$.pipe(map((settings) => settings.blobUrlPrefix)),
        { initialValue: "" },
    );
    private minVoteInterval = toSignal(
        this.settingsService.settings$.pipe(map((settings) => settings.minVoteInterval)),
        { initialValue: 1440 },
    );
    private title = computed(() => this.data()?.title ?? "");
    private description = computed(() => this.data()?.description ?? "");
    private icon = computed(() => this.data()?.icon ?? "");
    private shareKey = computed(() => this.data()?.shareKey ?? "");

    public topicUrl = computed(() => {
        const shareKey = this.shareKey();
        const baseUrl = this.shareTopicBaseUrl();
        return shareKey ? `${baseUrl}${shareKey}` : "";
    });
    public isVoteActive = computed(() => {
        const vote = this.vote();
        const minVoteInterval = this.minVoteInterval();
        return !!vote && VoteUtils.isActiveVote(vote, minVoteInterval);
    });
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
    public topicPicture = computed(() => {
        const prefix = this.blobUrlPrefix();
        const picturePath = this.data()?.picture ?? "";
        return prefix + picturePath;
    });
    public topicExpirationSeverity = computed(() => {
        const topic = this.data();
        if (!topic) {
            return null;
        }
        return TopicUtils.getExpirationSeverity(topic);
    });
}
