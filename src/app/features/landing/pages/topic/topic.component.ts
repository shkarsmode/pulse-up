import { TopicPublishedComponent } from "@/app/features/landing/ui/topic-published/topic-published.component";
import { FadeInDirective } from "@/app/shared/animations/fade-in.directive";
import { MapHeatmapLayerComponent } from "@/app/shared/components/map/map-heatmap-layer/map-heatmap-layer.component";
import { MapComponent } from "@/app/shared/components/map/map.component";
import { SliderComponent } from "@/app/shared/components/slider/slider.component";
import { CopyButtonComponent } from "@/app/shared/components/ui-kit/buttons/copy-button/copy-button.component";
import { FabButtonComponent } from '@/app/shared/components/ui-kit/buttons/fab-button/fab-button.component';
import { FlatButtonDirective } from "@/app/shared/components/ui-kit/buttons/flat-button/flat-button.directive";
import { QrcodeButtonComponent } from "@/app/shared/components/ui-kit/buttons/qrcode-button/qrcode-button.component";
import { SocialsButtonComponent } from "@/app/shared/components/ui-kit/buttons/socials-button/socials-button.component";
import { ContainerComponent } from "@/app/shared/components/ui-kit/container/container.component";
import { MenuComponent } from "@/app/shared/components/ui-kit/menu/menu.component";
import { SpinnerComponent } from "@/app/shared/components/ui-kit/spinner/spinner.component";
import { LoadImgPathDirective } from "@/app/shared/directives/load-img-path/load-img-path.directive";
import { WaveAnimationDirective } from "@/app/shared/directives/wave-animation/wave-animation.directive";
import { ITopic } from "@/app/shared/interfaces";
import { FormatNumberPipe } from "@/app/shared/pipes/format-number.pipe";
import { LinkifyPipe } from "@/app/shared/pipes/linkify.pipe";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { DialogService } from "@/app/shared/services/core/dialog.service";
import { ProfileService } from '@/app/shared/services/profile/profile.service';
import { CommonModule } from "@angular/common";
import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    effect,
    inject,
    OnDestroy,
    OnInit,
} from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, ParamMap, RouterModule } from "@angular/router";
import { SvgIconComponent } from "angular-svg-icon";
import { combineLatest, distinctUntilChanged, filter, map, tap } from "rxjs";
import { KeywordButtonComponent } from "../../ui/keyword-button/keyword-button.component";
import { LandingPageLayoutComponent } from "../../ui/landing-page-layout/landing-page-layout.component";
import { PulseCampaignComponent } from "../../ui/pulse-campaign/pulse-campaign.component";
import { PulseDescriptionComponent } from "../../ui/pulse-description/pulse-description.component";
import { TopicChrtsComponent } from "../../ui/topic-charts/topic-charts.component";
import { TopicSectionComponent } from "../../ui/topic-section/topic-section.component";
import { TopicWarningMessageComponent } from "../../ui/topic-warning-message/topic-warning-message.component";
import { DisbledVoteButtonComponent } from "../../ui/vote-button/disbled-vote-button/disbled-vote-button.component";
import { GuestVoteButtonComponent } from "../../ui/vote-button/guest-vote-button/guest-vote-button.component";
import { UserVoteButtonComponent } from "../../ui/vote-button/user-vote-button/user-vote-button.component";
import { TopicService } from "./topic.service";

@Component({
    selector: "app-topic",
    templateUrl: "./topic.component.html",
    styleUrl: "./topic.component.scss",
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        SvgIconComponent,
        MenuComponent,
        CopyButtonComponent,
        SocialsButtonComponent,
        MapComponent,
        SliderComponent,
        SpinnerComponent,
        FadeInDirective,
        FormatNumberPipe,
        LoadImgPathDirective,
        FlatButtonDirective,
        QrcodeButtonComponent,
        PulseCampaignComponent,
        MapHeatmapLayerComponent,
        WaveAnimationDirective,
        UserVoteButtonComponent,
        GuestVoteButtonComponent,
        DisbledVoteButtonComponent,
        KeywordButtonComponent,
        PulseDescriptionComponent,
        LinkifyPipe,
        LandingPageLayoutComponent,
        ContainerComponent,
        TopicSectionComponent,
        TopicChrtsComponent,
        TopicWarningMessageComponent,
        MatMenuModule,
        FabButtonComponent,
        MatTooltipModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicComponent implements OnInit, OnDestroy {
    private readonly destroyRef = inject(DestroyRef);
    private readonly route = inject(ActivatedRoute);
    private readonly pulseService = inject(PulseService);
    private readonly dialogService = inject(DialogService);
    private readonly settingsService = inject(SettingsService);
    private authService = inject(AuthenticationService);
    public topicService = inject(TopicService);
    public profileService: ProfileService = inject(ProfileService);

    private mutationObserver: MutationObserver | null = null;

    private isJustCreatedTopicPopupShown = false;

    public isReadMore = false;
    public map: mapboxgl.Map | null = null;
    public get topic() {
        return this.topicService.topic();
    }
    public isAnonymousUser = this.topicService.isAnonymousUser;
    public topicUrl = this.topicService.topicUrl;
    public isActiveVote = this.topicService.isActiveVote;
    public lastVoteInfo = this.topicService.lastVoteInfo;
    public shortPulseDescription = this.topicService.shortPulseDescription;
    public suggestions = this.topicService.suggestions;
    public isLoading = this.topicService.isLoading;
    public isArchived = this.topicService.isArchived;
    public qrCodePopupText = this.topicService.qrCodePopupText;
    public qrCodeBannerTitle = this.topicService.qrCodeBannerTitle;
    public qrCodeBannerText = this.topicService.qrCodeBannerText;
    public keywords = this.topicService.keywords;
    public mapCenterCoordinates = this.topicService.mapCenterCoordinates;
    public topicIcon$ = combineLatest([
        toObservable(this.topicService.topic),
        this.settingsService.settings$,
    ]).pipe(
        map(([topic, settings]) => {
            if (topic?.icon) {
                return `${settings.blobUrlPrefix}${topic.icon}`;
            }
            return "";
        }),
    );
    public get lastPulseTime() {
        return this.topicService.lastPulseTime();
    }

    constructor() {
        effect(() => {
            if (
                this.pulseService.isJustCreatedTopic &&
                this.topic &&
                !this.isJustCreatedTopicPopupShown
            ) {
                this.isJustCreatedTopicPopupShown = true;
                this.openJustCreatedTopicPopup(this.topic);
            }
        });
    }

    ngOnInit(): void {
        this.updatePageData();
    }

    ngOnDestroy(): void {
        this.mutationObserver?.disconnect();
        this.topicService.clearPageData();
    }

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
        this.topicService.setVoteAsExpired();
    }

    public onVoted(): void {
        this.topicService.refreshData();
    }

    private updatePageData(): void {
        this.route.paramMap
            .pipe(
                map((params: ParamMap) => {
                    const idParam = params.get("id") || "";
                    const topicId = parseInt(idParam);
                    return {
                        topicId: Number.isNaN(topicId) ? undefined : topicId,
                        shareKey: Number.isNaN(topicId) ? idParam : undefined,
                    };
                }),
                tap(({ topicId, shareKey }) => {
                    if (topicId) {
                        this.topicService.setTopicId(topicId);
                    } else if (shareKey) {
                        this.topicService.setTopicShareKey(shareKey);
                    }
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();

        this.authService.userToken
            .pipe(
                distinctUntilChanged(),
                filter((token) => !!token),
                tap(() => {
                    this.topicService.refreshData();
                    this.topicService.setAsUpdatedAfterUserSignIn();
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    private openJustCreatedTopicPopup(topic: ITopic): void {
        setTimeout(() => {
            this.dialogService.open<TopicPublishedComponent, { topic: ITopic }>(
                TopicPublishedComponent,
                {
                    data: {
                        topic,
                    },
                },
            );
        }, 1000);
    }

    // TOPICS_TO_TEST = {
    //     state: -1,
    //     topics: [
    //         topicActivePartialProgress,
    //         topicActiveAllCompleted,
    //         topicActiveEmpty,
    //         topicArchived,
    //         topicActiveOneGoalUnmet,
    //         topicActiveLastGoalInProgress,
    //         topicBlockedWithProgress,
    //     ],
    // };
    // public setAnotherData(): void {
    //     if (this.TOPICS_TO_TEST.state < 0) {
    //         this.TOPICS_TO_TEST.topics.push(this.topic);
    //         this.TOPICS_TO_TEST.state = 0;
    //     }
    //     if (this.TOPICS_TO_TEST.state >= this.TOPICS_TO_TEST.topics.length) {
    //         this.TOPICS_TO_TEST.state = 0;
    //     }
    //     this.updateTopicData({
    //         ...this.TOPICS_TO_TEST.topics[this.TOPICS_TO_TEST.topics.length - 1],
    //         ...this.TOPICS_TO_TEST.topics[this.TOPICS_TO_TEST.state],
    //     });

    //     this.TOPICS_TO_TEST.state++;
    // }
}

// export const topicActivePartialProgress: ITopic | any = {
//     id: 1,
//     title: "Test 1",
//     endsAt: "2025-07-30T23:59:59.999Z",
//     location: { country: "Ukraine" },
//     stats: {
//         totalVotes: 30,
//         lastDayVotes: 23,
//         totalUniqueUsers: 102,
//     },
//     state: TopicState.Active,
//     campaign: {
//         id: "1",
//         endsAt: "2025-10-30T23:59:59.999Z",
//         sponsorLink: "https://pulseup.com",
//         sponsorLogo: "",
//         sponsoredBy: "pulseup.com",
//         startsAt: "2025-09-10T00:00:00.000Z",
//         accomplishedGoals: ["2025-04-11T00:00:00.000Z"],
//         goals: [
//             { reward: "$100 donation to U24", supporters: 100 },
//             { reward: "$200 donation to U24", dailyVotes: 50 },
//             { reward: "$500 donation", lifetimeVotes: 120 },
//         ],
//     },
// };

// export const topicActiveAllCompleted: ITopic = {
//     ...topicActivePartialProgress,
//     title: "Test 2",
//     stats: {
//         totalVotes: 130,
//         lastDayVotes: 60,
//         totalUniqueUsers: 130,
//     },
//     campaign: {
//         ...topicActivePartialProgress.campaign!,
//         accomplishedGoals: [
//             // "2025-04-11T00:00:00.000Z",
//             // "2025-04-12T00:00:00.000Z",
//             // "2025-04-13T00:00:00.000Z",
//         ],
//     },
// };

// export const topicActiveEmpty: ITopic = {
//     ...topicActivePartialProgress,
//     title: "Test 3",
//     stats: {
//         totalVotes: 0,
//         lastDayVotes: 0,
//         totalUniqueUsers: 0,
//     },
//     campaign: {
//         ...topicActivePartialProgress.campaign!,
//         accomplishedGoals: [],
//     },
// };

// export const topicArchived: ITopic = {
//     ...topicActivePartialProgress,
//     title: "Test 4",
//     state: TopicState.Archived,
//     campaign: {
//         ...topicActivePartialProgress.campaign!,
//         endsAt: "2025-04-10T23:59:59.999Z",
//     },
// };

// export const topicActiveOneGoalUnmet: ITopic = {
//     ...topicActivePartialProgress,
//     title: "Test 5",
//     stats: {
//         totalVotes: 0,
//         lastDayVotes: 0,
//         totalUniqueUsers: 23,
//     },
//     campaign: {
//         ...topicActivePartialProgress.campaign!,
//         goals: [{ reward: "$50 donation to U24", supporters: 100 }],
//         accomplishedGoals: [],
//     },
// };

// export const topicActiveLastGoalInProgress: ITopic = {
//     ...topicActivePartialProgress,
//     title: "Test 6",
//     stats: {
//         totalVotes: 90, // progress on lifetimeVotes (120 goal)
//         lastDayVotes: 50,
//         totalUniqueUsers: 130,
//     },
//     campaign: {
//         ...topicActivePartialProgress.campaign!,
//         accomplishedGoals: ["2025-04-11T00:00:00.000Z", "2025-04-12T00:00:00.000Z"],
//     },
// };

// export const topicBlockedWithProgress: ITopic = {
//     ...topicActiveAllCompleted,
//     title: "Test 7",
//     state: TopicState.Blocked,
//     campaign: {
//         ...topicActiveAllCompleted.campaign!,
//         endsAt: "2025-08-01T00:00:00.000Z",
//     },
// };
