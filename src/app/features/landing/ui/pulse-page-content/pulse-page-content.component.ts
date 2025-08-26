import { ChangeDetectionStrategy, Component, DestroyRef, inject, Input } from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { combineLatest, map } from "rxjs";
import { toObservable } from "@angular/core/rxjs-interop";
import { AngularSvgIconModule } from "angular-svg-icon";
import { FadeInDirective } from "@/app/shared/animations/fade-in.directive";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { PulsePageService } from "../../services/pulse-page.service";
import { ITopic } from "@/app/shared/interfaces";
import { FormatNumberPipe } from "@/app/shared/pipes/format-number.pipe";
import { VoteButtonComponent } from "../vote-button/vote-button.component";
import { MenuComponent } from "@/app/shared/components/ui-kit/menu/menu.component";
import { PulseCampaignComponent } from "../pulse-campaign/pulse-campaign.component";
import { IVote } from "@/app/shared/interfaces/vote.interface";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";
import { PendingTopicsService } from "@/app/shared/services/topic/pending-topics.service";
import { DialogService } from "@/app/shared/services/core/dialog.service";
import { VotesService } from "@/app/shared/services/votes/votes.service";
import { MapComponent } from "@/app/shared/components/map/map.component";
import { MapHeatmapLayerComponent } from "@/app/shared/components/map/map-heatmap-layer/map-heatmap-layer.component";
import { SliderComponent } from "@/app/shared/components/slider/slider.component";
import { TopPulseCardComponent } from "@/app/shared/components/pulses/top-pulse/top-pulse-card.component";
import { CopyButtonComponent } from "@/app/shared/components/ui-kit/buttons/copy-button/copy-button.component";
import { SocialsButtonComponent } from "@/app/shared/components/ui-kit/buttons/socials-button/socials-button.component";
import { QrcodeButtonComponent } from "@/app/shared/components/ui-kit/buttons/qrcode-button/qrcode-button.component";

@Component({
    selector: "app-pulse-page-content",
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FadeInDirective,
        AngularSvgIconModule,
        FormatNumberPipe,
        VoteButtonComponent,
        MenuComponent,
        PulseCampaignComponent,
        MapComponent,
        MapHeatmapLayerComponent,
        SliderComponent,
        TopPulseCardComponent,
        CopyButtonComponent,
        SocialsButtonComponent,
        QrcodeButtonComponent,
    ],
    templateUrl: "./pulse-page-content.component.html",
    styleUrl: "./pulse-page-content.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PulsePageContentComponent {
    @Input() topic: ITopic;

    private readonly destroyRef = inject(DestroyRef);
    private readonly route = inject(ActivatedRoute);
    private readonly pulseService = inject(PulseService);
    private readonly authService = inject(AuthenticationService);
    private readonly dialogService = inject(DialogService);
    private readonly pendingTopicsService = inject(PendingTopicsService);
    private readonly votesService = inject(VotesService);
    private readonly pulsePageService = inject(PulsePageService);
    private readonly settingsService = inject(SettingsService);

    public isReadMore = false;
    public map: mapboxgl.Map | null = null;
    public vote = this.pulsePageService.vote;
    public topicUrl = this.pulsePageService.topicUrl;
    public isActiveVote = this.pulsePageService.isActiveVote;
    public lastVoteInfo = this.pulsePageService.lastVoteInfo;
    public shortPulseDescription = this.pulsePageService.shortPulseDescription;
    public suggestions = this.pulsePageService.suggestions;

    public topicIcon$ = combineLatest([
        toObservable(this.pulsePageService.topic),
        this.settingsService.settings$,
    ]).pipe(
        map(([topic, settings]) => {
            if (topic?.icon) {
                return `${settings.blobUrlPrefix}${topic.icon}`;
            }
            return "";
        }),
    );

    public onMapLoaded(map: mapboxgl.Map): void {
        this.map = map;
    }

    public onReadMore(): void {
        this.isReadMore = true;
    }

    public onCopyLink(event: MouseEvent) {
        event.stopPropagation();
    }

    public onVoteExpired() {
        this.pulsePageService.setVoteAsExpired();
    }

    public onVoted(vote: IVote): void {
        const topic = this.topic;
        if (!topic) return;
        this.pendingTopicsService.add({
            ...topic,
            stats: {
                totalVotes: (topic.stats?.totalVotes || 0) + 1,
                lastDayVotes: (topic.stats?.lastDayVotes || 0) + 1,
                totalUniqueUsers: topic.stats?.totalUniqueUsers || 0,
            },
        });
        this.votesService.addVote(vote);
        this.pulsePageService.refreshData();
    }

    private observeDescriptionMutations(): void {
        if (!this.description?.nativeElement) return;

        this.mutationObserver = new MutationObserver(() => {
            this.checkIfTruncated();
        });

        this.mutationObserver.observe(this.description.nativeElement, {
            childList: true,
            subtree: true,
            characterData: true,
        });
    }

    private checkIfTruncated(): void {
        const textElement = this.description?.nativeElement;
        if (!textElement) return;

        const fullHeight = textElement.scrollHeight;
        const visibleHeight = textElement.clientHeight + 2;
        const heightDiff = fullHeight - visibleHeight;
        const isTruncated = heightDiff > 19;

        this.isReadMore = !isTruncated;
    }
}
