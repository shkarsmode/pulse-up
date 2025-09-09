import { TopicPublishedComponent } from "@/app/features/landing/ui/topic-published/topic-published.component";
import { FadeInDirective } from "@/app/shared/animations/fade-in.directive";
import { TopPulseCardComponent } from "@/app/shared/components/pulses/top-pulse/top-pulse-card.component";
import { SliderComponent } from "@/app/shared/components/slider/slider.component";
import { CopyButtonComponent } from "@/app/shared/components/ui-kit/buttons/copy-button/copy-button.component";
import { FlatButtonDirective } from "@/app/shared/components/ui-kit/buttons/flat-button/flat-button.directive";
import { QrcodeButtonComponent } from "@/app/shared/components/ui-kit/buttons/qrcode-button/qrcode-button.component";
import { SocialsButtonComponent } from "@/app/shared/components/ui-kit/buttons/socials-button/socials-button.component";
import { MenuComponent } from "@/app/shared/components/ui-kit/menu/menu.component";
import { SpinnerComponent } from "@/app/shared/components/ui-kit/spinner/spinner.component";
import { LoadImgPathDirective } from "@/app/shared/directives/load-img-path/load-img-path.directive";
import { IVote } from "@/app/shared/interfaces/vote.interface";
import { FormatNumberPipe } from "@/app/shared/pipes/format-number.pipe";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { DialogService } from "@/app/shared/services/core/dialog.service";
import { PendingTopicsService } from "@/app/shared/services/topic/pending-topics.service";
import { CommonModule } from "@angular/common";
import {
    Component,
    DestroyRef,
    ElementRef,
    inject,
    OnInit,
    ViewChild,
    OnDestroy,
    ChangeDetectionStrategy,
} from "@angular/core";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { ActivatedRoute, ParamMap, RouterModule } from "@angular/router";
import { SvgIconComponent } from "angular-svg-icon";
import { combineLatest, distinctUntilChanged, filter, map, tap } from "rxjs";
import { TopicQRCodePopupData } from "../../interfaces/topic-qrcode-popup-data.interface";
import { MapComponent } from "@/app/shared/components/map/map.component";
import { TopicQrcodePopupComponent } from "../../ui/topic-qrcode-popup/topic-qrcode-popup.component";
import { UserVoteButtonComponent } from "../../ui/vote-button/user-vote-button/user-vote-button.component";
import { PulseCampaignComponent } from "../../ui/pulse-campaign/pulse-campaign.component";
import { VotesService } from "@/app/shared/services/votes/votes.service";
import { MapHeatmapLayerComponent } from "@/app/shared/components/map/map-heatmap-layer/map-heatmap-layer.component";
import { WaveAnimationDirective } from "@/app/shared/directives/wave-animation/wave-animation.directive";
import { PulsePageService } from "./pulse-page.service";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { TimeFromNowPipe } from "@/app/shared/pipes/time-from-now.pipe";
import { GuestVoteButtonComponent } from "../../ui/vote-button/guest-vote-button/guest-vote-button.component";
import { DisbledVoteButtonComponent } from "../../ui/vote-button/disbled-vote-button/disbled-vote-button.component";

@Component({
    selector: "app-pulse-page",
    templateUrl: "./pulse-page.component.html",
    styleUrl: "./pulse-page.component.scss",
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
        TopPulseCardComponent,
        SpinnerComponent,
        FadeInDirective,
        FormatNumberPipe,
        LoadImgPathDirective,
        FlatButtonDirective,
        QrcodeButtonComponent,
        PulseCampaignComponent,
        MapHeatmapLayerComponent,
        WaveAnimationDirective,
        TimeFromNowPipe,
        UserVoteButtonComponent,
        GuestVoteButtonComponent,
        DisbledVoteButtonComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PulsePageComponent implements OnInit, OnDestroy {
    private readonly destroyRef = inject(DestroyRef);
    private readonly route = inject(ActivatedRoute);
    private readonly pulseService = inject(PulseService);
    private readonly authService = inject(AuthenticationService);
    private readonly dialogService = inject(DialogService);
    private readonly pendingTopicsService = inject(PendingTopicsService);
    private readonly votesService = inject(VotesService);
    private readonly pulsePageService = inject(PulsePageService);
    private readonly settingsService = inject(SettingsService);

    @ViewChild("description", { static: false })
    set descriptionElement(el: ElementRef<HTMLDivElement> | undefined) {
        if (el) {
            this.description = el;
            this.checkIfDescriptionTruncated();
        }
    }
    private description?: ElementRef<HTMLDivElement>;
    private mutationObserver: MutationObserver | null = null;

    public isReadMore = false;
    public map: mapboxgl.Map | null = null;
    public get topic() {
        return this.pulsePageService.topic();
    }
    public isAnonymousUser = this.pulsePageService.isAnonymousUser;
    public topicUrl = this.pulsePageService.topicUrl;
    public isActiveVote = this.pulsePageService.isActiveVote;
    public lastVoteInfo = this.pulsePageService.lastVoteInfo;
    public shortPulseDescription = this.pulsePageService.shortPulseDescription;
    public suggestions = this.pulsePageService.suggestions;
    public isLoading = this.pulsePageService.isLoading;
    public isArchived = this.pulsePageService.isArchived;
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
    public get lastPulseTime() {
        return this.pulsePageService.lastPulseTime();
    }

    ngOnInit(): void {
        this.updatePageData();
        this.openJustCreatedTopicPopup();
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant",
        });
    }

    ngOnDestroy(): void {
        this.mutationObserver?.disconnect();
        this.pulsePageService.clearPageData();
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
        this.pulsePageService.setVoteAsExpired();
    }

    public openQrCodePopup = (): void => {
        this.dialogService.open<TopicQrcodePopupComponent, TopicQRCodePopupData>(
            TopicQrcodePopupComponent,
            {
                width: "400px",
                data: {
                    link: this.topicUrl(),
                    type: "topic",
                },
            },
        );
    };

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
                        this.pulsePageService.setTopicId(topicId);
                    } else if (shareKey) {
                        this.pulsePageService.setTopicShareKey(shareKey);
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
                    this.pulsePageService.refreshData();
                    this.pulsePageService.setAsUpdatedAfterUserSignIn();
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    private openJustCreatedTopicPopup(): void {
        if (this.pulseService.isJustCreatedTopic) {
            setTimeout(() => {
                this.dialogService.open(TopicPublishedComponent, {
                    data: {
                        shareKey: this.topic?.shareKey,
                    },
                });
            }, 1000);
        }
    }

    private checkIfDescriptionTruncated(): void {
        const textElement = this.description?.nativeElement;
        if (!textElement) return;

        const fullHeight = textElement.scrollHeight;
        const visibleHeight = textElement.clientHeight + 2;
        const heightDiff = fullHeight - visibleHeight;
        const isTruncated = heightDiff > 19;

        this.isReadMore = !isTruncated;
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
