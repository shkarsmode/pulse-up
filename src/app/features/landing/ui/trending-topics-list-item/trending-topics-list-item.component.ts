import { Component, computed, inject, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AngularSvgIconModule } from "angular-svg-icon";
import { MatButtonModule } from "@angular/material/button";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";
import { LargePulseComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse.component";
import { LargePulseIconComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-icon/large-pulse-icon.component";
import { FormatNumberPipe } from "@/app/shared/pipes/format-number.pipe";
import { Campaign, ITopic } from "@/app/shared/interfaces";
import { LargePulseTitleComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-title/large-pulse-title.component";
import { LargePulseDescriptionComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-description/large-pulse-description.component";
import { LargePulseMetaComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-meta/large-pulse-meta.component";
import { LargePulseMetricComponent } from "@/app/shared/components/pulses/large-pulse/large-pulse-metric/large-pulse-metric.component";
import { MenuComponent } from "@/app/shared/components/ui-kit/menu/menu.component";
import { SocialsButtonComponent } from "@/app/shared/components/ui-kit/buttons/socials-button/socials-button.component";
import { QrcodeButtonComponent } from "@/app/shared/components/ui-kit/buttons/qrcode-button/qrcode-button.component";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { CopyTopicButtonComponent } from "../copy-topic-button/copy-topic-button.component";
import { IVote } from "@/app/shared/interfaces/vote.interface";
import { VoteUtils } from "@/app/shared/helpers/vote-utils";
import { WaveAnimationDirective } from "@/app/shared/directives/wave-animation/wave-animation.directive";

@Component({
    selector: "app-trending-topics-list-item",
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
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
        WaveAnimationDirective,
    ],
    templateUrl: "./trending-topics-list-item.component.html",
    styleUrl: "./trending-topics-list-item.component.scss",
})
export class TrendingTopicsListItemComponent {
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
    private shareKey = computed(() => this.data()?.shareKey ?? "");

    public topicUrl = computed(
        () => `${this.shareTopicBaseUrl()}${this.shareKey()}`,
    );
    public isVoteActive = computed(() =>{
        const vote = this.vote();
        const minVoteInterval = this.minVoteInterval();
        return !!vote && VoteUtils.isActiveVote(vote, minVoteInterval);
    });
    public qrCodePopupText = computed(() => `Share the '${this.data()?.title}' topic with this QR code.`);
    public qrCodeBannerTitle = computed(() => this.data()?.title ?? '');
    public qrCodeBannerText = computed(() => this.data()?.description ?? '');
    public qrCodeBannerIcon = computed(() => {
        return this.blobUrlPrefix() + (this.data()?.icon ?? '');
    });
    public isCampaignBadgeVisible = computed(() => {
        const campaign = this.data()?.campaign;
        return !!campaign && this.isCampaignActive(campaign);
    })

    private isCampaignActive(campaign: Campaign): boolean {
        return (
            new Date(campaign.startsAt) < new Date() &&
            new Date(campaign.endsAt) > new Date() &&
            (campaign.accomplishedGoals?.length || 0) < campaign.goals.length
        );
    }
}
