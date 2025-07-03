import { Component, DestroyRef, ElementRef, inject, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, ParamMap, Router, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import {
    BehaviorSubject,
    catchError,
    first,
    forkJoin,
    map,
    Observable,
    of,
    switchMap,
    take,
    tap,
} from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SvgIconComponent } from "angular-svg-icon";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { MatDialog } from "@angular/material/dialog";
import { ITopic, TopicState } from "@/app/shared/interfaces";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { MetadataService } from "@/app/shared/services/core/metadata.service";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { FadeInDirective } from "@/app/shared/animations/fade-in.directive";
import { FormatNumberPipe } from "@/app/shared/pipes/format-number.pipe";
import { MenuComponent } from "@/app/shared/components/ui-kit/menu/menu.component";
import { CopyButtonComponent } from "@/app/shared/components/ui-kit/buttons/copy-button/copy-button.component";
import { SocialsButtonComponent } from "@/app/shared/components/ui-kit/buttons/socials-button/socials-button.component";
import { MapComponent } from "../../ui/map/map.component";
import { SliderComponent } from "@/app/shared/components/slider/slider.component";
import { TopPulseCardComponent } from "@/app/shared/components/pulses/top-pulse/top-pulse-card.component";
import { SpinnerComponent } from "@/app/shared/components/ui-kit/spinner/spinner.component";
import { LoadImgPathDirective } from "@/app/shared/directives/load-img-path/load-img-path.directive";
import { FlatButtonDirective } from "@/app/shared/components/ui-kit/buttons/flat-button/flat-button.directive";
import { TopicPublishedComponent } from "@/app/shared/components/popups/topic-published/topic-published.component";
import { PulseButtonComponent } from "../../ui/pulse-button/pulse-button.component";
import { VoteService } from "@/app/shared/services/api/vote.service";
import { NotificationService } from "@/app/shared/services/core/notification.service";
import { IVote } from "@/app/shared/interfaces/vote.interface";
import { VoteUtils } from "@/app/shared/helpers/vote-utils";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";
import { PendingTopicsService } from "@/app/shared/services/topic/pending-topics.service";
import { VotingService } from "@/app/shared/services/core/voting.service";

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
        PulseButtonComponent,
    ],
})
export class PulsePageComponent implements OnInit {
    @ViewChild("description", { static: false })
    private dialog: MatDialog = inject(MatDialog);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly pulseService = inject(PulseService);
    private readonly metadataService = inject(MetadataService);
    private readonly settingsService = inject(SettingsService);
    private readonly voteService = inject(VoteService);
    private readonly votingService = inject(VotingService);
    private readonly notificationService = inject(NotificationService);
    private readonly authService = inject(AuthenticationService);
    private readonly pendingTopicsService = inject(PendingTopicsService);
    private readonly destroyRef = inject(DestroyRef);
    private mutationObserver: MutationObserver | null = null;

    topic: ITopic | null = null;
    isReadMore: boolean = false;
    isLoading: boolean = true;
    suggestions: ITopic[] = [];
    topicUrl: string = "";
    shortPulseDescription: string = "";
    isArchived: boolean = false;
    description: ElementRef<HTMLDivElement>;
    vote: IVote | null = null;
    isActiveVote: boolean = false;
    lastVoteInfo: string = "";
    get isAnonymousUser() {
        return this.authService.anonymousUserValue;
    }

    ngOnInit(): void {
        this.getInitialData();
        this.listenToUserChanges();
        this.openJustCtreatedTipicPopup();
    }

    ngAfterViewInit(): void {
        this.observeDescriptionMutations();
    }

    ngOnDestroy(): void {
        this.mutationObserver?.disconnect();
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

    public onVoted() {
        if (!this.topic) return;
        this.pendingTopicsService.add({
            ...this.topic,
            stats: {
                totalVotes: (this.topic.stats?.totalVotes || 0) + 1,
                lastDayVotes: (this.topic.stats?.lastDayVotes || 0) + 1,
                totalUniqueUsers: this.topic.stats?.totalUniqueUsers || 0,
            },
        });
        this.loadTopicData(this.topic.id).pipe(first()).subscribe();
    }

    private getInitialData(): void {
        this.route.paramMap
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                map((params: ParamMap) => +params.get("id")!),
                tap(() => {
                    this.topic = null;
                    this.isLoading = true;
                }),
                switchMap(this.loadTopicData.bind(this)),
                tap(() => (this.isLoading = false)),
            )
            .subscribe();
    }

    private loadTopicData(topicId: number) {
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
    }

    private getVote(topicId: number) {
        if (this.isAnonymousUser) {
            return of(null);
        }
        return this.voteService.getMyVotes({ topicId }).pipe(
            first(),
            catchError((error) => {
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
            catchError((error) => {
                this.router.navigateByUrl("/" + AppRoutes.Community.INVALID_LINK);
                return of(error);
            }),
        ) as Observable<ITopic>;
    }

    private updateTopicData(topic: ITopic): void {
        this.topic = topic;
        this.shortPulseDescription = topic.description.replace(/\n/g, " ");
        this.topicUrl = this.settingsService.shareTopicBaseUrl + topic.shareKey;
        this.isArchived = topic.state === TopicState.Archived;
    }

    private updateVoteData(vote: IVote): void {
        this.vote = vote;
        this.isActiveVote = VoteUtils.isActiveVote(vote, this.settingsService.minVoteInterval);
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
        let link = this.extractUrl(topic.description);

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

    private openJustCtreatedTipicPopup(): void {
        const matDialog = this.dialog;
        if (this.pulseService.isJustCreatedTopic) {
            setTimeout(() => {
                matDialog.open(TopicPublishedComponent, {
                    width: "500px",
                    panelClass: "custom-dialog-container",
                    backdropClass: "custom-dialog-backdrop",
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
        this.authService.user$.pipe(
            first((user) => !!user),
            tap(() => this.getInitialData()),
        );
    }
}
