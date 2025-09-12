import { Component, inject, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AngularSvgIconModule } from "angular-svg-icon";
import { MatButtonModule } from "@angular/material/button";
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
export class TrendingTopicsListItemComponent implements OnInit {
    private readonly settingsService = inject(SettingsService);

    @Input({ required: true }) data: ITopic;
    @Input() vote?: IVote | null = null;

    public topicUrl$ = this.settingsService.settings$.pipe(
        map((settings) => `${settings.shareTopicBaseUrl}${this.data.shareKey}`),
    );
    public isVoteActive$ = this.settingsService.settings$.pipe(
        map(
            (settings) =>
                !!this.vote && VoteUtils.isActiveVote(this.vote, settings.minVoteInterval),
        ),
    );
    public isCampaignBadgeVisible: boolean;

    public get qrCodePopupText(): string {
        return `Share the '${this.data.title}' topic with this QR code.`;
    }

    public get qrCodeBannerTitle(): string {
        return this.data.title;
    }

    public get qrCodeBannerText(): string {
        return this.data.description;
    }

    public ngOnInit() {
        this.isCampaignBadgeVisible =
            !!this.data.campaign && this.isCampaignActive(this.data.campaign);
    }

    private isCampaignActive(campaign: Campaign): boolean {
        return (
            new Date(campaign.startsAt) < new Date() &&
            new Date(campaign.endsAt) > new Date() &&
            (campaign.accomplishedGoals?.length || 0) < campaign.goals.length
        );
    }
}
