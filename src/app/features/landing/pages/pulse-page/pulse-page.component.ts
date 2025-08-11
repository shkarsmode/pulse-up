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
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { VoteUtils } from "@/app/shared/helpers/vote-utils";
import { ITopic, TopicState } from "@/app/shared/interfaces";
import { IVote } from "@/app/shared/interfaces/vote.interface";
import { FormatNumberPipe } from "@/app/shared/pipes/format-number.pipe";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { VoteService } from "@/app/shared/services/api/vote.service";
import { DialogService } from "@/app/shared/services/core/dialog.service";
import { MetadataService } from "@/app/shared/services/core/metadata.service";
import { NotificationService } from "@/app/shared/services/core/notification.service";
import { PendingTopicsService } from "@/app/shared/services/topic/pending-topics.service";
import { CommonModule } from "@angular/common";
import {
    Component,
    DestroyRef,
    ElementRef,
    inject,
    OnInit,
    ViewChild,
    AfterViewInit,
    OnDestroy,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, ParamMap, Router, RouterModule } from "@angular/router";
import { SvgIconComponent } from "angular-svg-icon";
import { catchError, first, forkJoin, map, Observable, of, switchMap, tap } from "rxjs";
import { TopicQRCodePopupData } from "../../helpers/interfaces/topic-qrcode-popup-data.interface";
import { MapComponent } from "@/app/shared/components/map/map.component";
import { TopicQrcodePopupComponent } from "../../ui/topic-qrcode-popup/topic-qrcode-popup.component";
import { VoteButtonComponent } from "../../ui/vote-button/vote-button.component";
import { PulseCampaignComponent } from "./pulse-campaign/pulse-campaign.component";
import { VotesService } from "@/app/shared/services/votes/votes.service";
import { MapHeatmapLayerComponent } from "@/app/shared/components/map/map-heatmap-layer/map-heatmap-layer.component";

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
        VoteButtonComponent,
        QrcodeButtonComponent,
        PulseCampaignComponent,
        MapHeatmapLayerComponent,
    ],
})
export class PulsePageComponent implements OnInit, AfterViewInit, OnDestroy {
    private readonly destroyRef = inject(DestroyRef);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly pulseService = inject(PulseService);
    private readonly metadataService = inject(MetadataService);
    private readonly settingsService = inject(SettingsService);
    private readonly voteService = inject(VoteService);
    private readonly notificationService = inject(NotificationService);
    private readonly authService = inject(AuthenticationService);
    private readonly dialogService = inject(DialogService);
    private readonly pendingTopicsService = inject(PendingTopicsService);
    private readonly votesService = inject(VotesService);
    private mutationObserver: MutationObserver | null = null;

    @ViewChild("description", { static: false }) description!: ElementRef<HTMLDivElement>;

    topic: ITopic | null = null;
    isReadMore = false;
    isLoading = true;
    suggestions: ITopic[] = [];
    topicUrl = "";
    shortPulseDescription = "";
    isArchived = false;
    vote: IVote | null = null;
    isActiveVote = false;
    lastVoteInfo = "";
    map: mapboxgl.Map | null = null;
    globalSettings = {
        shareTopicBaseUrl: "",
        minVoteInterval: 0,
    };

    get isAnonymousUser() {
        return !!this.authService.anonymousUserValue;
    }

    ngOnInit(): void {
        this.getInitialData();
        this.listenToUserChanges();
        this.openJustCreatedTopicPopup();
        this.loadGlobalSettings();
    }

    ngAfterViewInit(): void {
        this.observeDescriptionMutations();
    }

    ngOnDestroy(): void {
        this.mutationObserver?.disconnect();
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
        this.isActiveVote = false;
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

    public onVoted(vote: IVote): void {
        if (!this.topic) return;
        this.pendingTopicsService.add({
            ...this.topic,
            stats: {
                totalVotes: (this.topic.stats?.totalVotes || 0) + 1,
                lastDayVotes: (this.topic.stats?.lastDayVotes || 0) + 1,
                totalUniqueUsers: this.topic.stats?.totalUniqueUsers || 0,
            },
        });
        this.votesService.addVote(vote);
        this.loadTopicData({ topicId: this.topic.id }).pipe(first()).subscribe();
    }

    private getInitialData(): void {
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
                tap(() => {
                    this.topic = null;
                    this.isLoading = true;
                }),
                switchMap(this.loadTopicData.bind(this)),
                tap(() => (this.isLoading = false)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    private loadGlobalSettings(): void {
        this.settingsService.settings$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((settings) => {
            this.globalSettings.shareTopicBaseUrl = settings.shareTopicBaseUrl;
            this.globalSettings.minVoteInterval = settings.minVoteInterval;
        });
    }

    private loadTopicData({ topicId, shareKey = "" }: { topicId?: number; shareKey?: string }) {
        if (topicId) {
            return forkJoin({
                topic: this.getTopic(topicId),
                votes: this.getVote(topicId),
            }).pipe(
                tap(({ topic, votes }) => {
                    this.updateTopicData(topic);
                    this.createLink(topic);
                    this.updateSuggestions();
                    this.updateMetadata(topic);
                    if (votes && votes[0]) {
                        this.updateVoteData(votes[0]);
                    }
                }),
            );
        } else {
            return this.getTopic(shareKey).pipe(
                switchMap((topic) => {
                    this.updateTopicData(topic);
                    this.createLink(topic);
                    this.updateSuggestions();
                    this.updateMetadata(topic);
                    return this.getVote(topic.id).pipe(
                        tap((vote) => {
                            if (vote && vote[0]) {
                                this.updateVoteData(vote[0]);
                            }
                        }),
                        map((votes) => ({
                            topic,
                            votes,
                        })),
                    );
                }),
            );
        }
    }

    private getVote(topicId: number) {
        if (this.isAnonymousUser) {
            return of(null);
        }
        return this.voteService.getMyVotes({ topicId }).pipe(
            first(),
            catchError(() => {
                this.notificationService.error(
                    "Failed to fetch your vote. Please reload the page.",
                );
                return of(null);
            }),
        );
    }

    private getTopic(id: string | number) {
        return this.pulseService.getById(id).pipe(
            first(),
            catchError((error: unknown) => {
                this.router.navigateByUrl("/" + AppRoutes.Community.INVALID_LINK);
                return of(error);
            }),
        ) as Observable<ITopic>;
    }

    TOPICS_TO_TEST = {
        state: -1,
        topics: [
            topicActivePartialProgress,
            topicActiveAllCompleted,
            topicActiveEmpty,
            topicArchived,
            topicActiveOneGoalUnmet,
            topicActiveLastGoalInProgress,
            topicBlockedWithProgress,
        ],
    };
    public setAnotherData(): void {
        if (this.TOPICS_TO_TEST.state < 0) {
            this.TOPICS_TO_TEST.topics.push(this.topic);
            this.TOPICS_TO_TEST.state = 0;
        }
        if (this.TOPICS_TO_TEST.state >= this.TOPICS_TO_TEST.topics.length) {
            this.TOPICS_TO_TEST.state = 0;
        }
        this.updateTopicData({
            ...this.TOPICS_TO_TEST.topics[this.TOPICS_TO_TEST.topics.length - 1],
            ...this.TOPICS_TO_TEST.topics[this.TOPICS_TO_TEST.state],
        });

        this.TOPICS_TO_TEST.state++;
    }

    private updateTopicData(topic: ITopic): void {
        this.topic = topic;
        this.shortPulseDescription = topic.description.replace(/\n/g, " ");
        this.topicUrl = this.globalSettings.shareTopicBaseUrl + topic.shareKey;
        this.isArchived = topic.state === TopicState.Archived;
    }

    private updateVoteData(vote: IVote): void {
        this.vote = vote;
        this.isActiveVote = VoteUtils.isActiveVote(vote, this.globalSettings.minVoteInterval);
        this.lastVoteInfo = VoteUtils.parseVoteInfo(vote);
    }

    private updateMetadata(topic: ITopic): void {
        this.metadataService.setTitle(`${topic.title} | Support What Matters – Pulse Up`);
        this.metadataService.setMetaTag(
            "description",
            `Support '${topic.title}' anonymously and see how it’s trending in real time across the map. Track public sentiment and join the pulse.`,
        );
    }

    private updateSuggestions(): void {
        this.pulseService
            .get()
            .pipe(first())
            .subscribe((pulses) => {
                const category = this.topic?.category;
                const sameCategoryTopics = pulses
                    .filter((pulse) => pulse.category === category)
                    .filter((pulse) => pulse.id !== this.topic?.id);
                this.suggestions =
                    category && sameCategoryTopics.length
                        ? sameCategoryTopics.slice(0, 3)
                        : pulses.slice(0, 3);
            });
    }

    private createLink(topic: ITopic): void {
        const link = this.extractUrl(topic.description);

        if (!link || !this.topic) return;

        this.topic.description = topic.description.replace(link, "");

        this.topic.description =
            this.topic.description + `<a href="${link}" rel="nofollow" target="_blank">${link}</a>`;
    }

    private extractUrl(value: string): string | null {
        // Regular expression to match URLs (basic version)
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const match = value.match(urlRegex);

        // If there's a match, return the first URL, otherwise return null
        return match ? match[0] : null;
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

    private listenToUserChanges() {
        this.authService.firebaseUser$.pipe(
            first((user) => !!user),
            tap(() => this.getInitialData()),
        );
    }
}

export const topicActivePartialProgress: ITopic | any = {
    id: 1,
    title: "Test 1",
    endsAt: "2025-07-30T23:59:59.999Z",
    location: { country: "Ukraine" },
    stats: {
        totalVotes: 30,
        lastDayVotes: 23,
        totalUniqueUsers: 102,
    },
    state: TopicState.Active,
    campaign: {
        id: "1",
        endsAt: "2025-07-30T23:59:59.999Z",
        sponsorLink: "https://pulseup.com",
        sponsorLogo: "",
        sponsoredBy: "pulseup.com",
        startsAt: "2025-04-10T00:00:00.000Z",
        accomplishedGoals: ["2025-04-11T00:00:00.000Z"],
        goals: [
            { reward: "$100 donation to U24", supporters: 100 },
            { reward: "$200 donation to U24", dailyVotes: 50 },
            { reward: "$500 donation", lifetimeVotes: 120 },
        ],
    },
};

export const topicActiveAllCompleted: ITopic = {
    ...topicActivePartialProgress,
    title: "Test 2",
    stats: {
        totalVotes: 130,
        lastDayVotes: 60,
        totalUniqueUsers: 130,
    },
    campaign: {
        ...topicActivePartialProgress.campaign!,
        accomplishedGoals: [
            "2025-04-11T00:00:00.000Z",
            "2025-04-12T00:00:00.000Z",
            "2025-04-13T00:00:00.000Z",
        ],
    },
};

export const topicActiveEmpty: ITopic = {
    ...topicActivePartialProgress,
    title: "Test 3",
    stats: {
        totalVotes: 0,
        lastDayVotes: 0,
        totalUniqueUsers: 0,
    },
    campaign: {
        ...topicActivePartialProgress.campaign!,
        accomplishedGoals: [],
    },
};

export const topicArchived: ITopic = {
    ...topicActivePartialProgress,
    title: "Test 4",
    state: TopicState.Archived,
    campaign: {
        ...topicActivePartialProgress.campaign!,
        endsAt: "2025-04-10T23:59:59.999Z",
    },
};

export const topicActiveOneGoalUnmet: ITopic = {
    ...topicActivePartialProgress,
    title: "Test 5",
    stats: {
        totalVotes: 0,
        lastDayVotes: 0,
        totalUniqueUsers: 23,
    },
    campaign: {
        ...topicActivePartialProgress.campaign!,
        goals: [{ reward: "$50 donation to U24", supporters: 100 }],
        accomplishedGoals: [],
    },
};

export const topicActiveLastGoalInProgress: ITopic = {
    ...topicActivePartialProgress,
    title: "Test 6",
    stats: {
        totalVotes: 90, // progress on lifetimeVotes (120 goal)
        lastDayVotes: 50,
        totalUniqueUsers: 130,
    },
    campaign: {
        ...topicActivePartialProgress.campaign!,
        accomplishedGoals: ["2025-04-11T00:00:00.000Z", "2025-04-12T00:00:00.000Z"],
    },
};

export const topicBlockedWithProgress: ITopic = {
    ...topicActiveAllCompleted,
    title: "Test 7",
    state: TopicState.Blocked,
    campaign: {
        ...topicActiveAllCompleted.campaign!,
        endsAt: "2025-08-01T00:00:00.000Z",
    },
};
