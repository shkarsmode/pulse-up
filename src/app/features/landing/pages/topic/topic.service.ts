import { AppConstants, QUERY_KEYS } from "@/app/shared/constants";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { isHttpErrorResponse } from "@/app/shared/helpers/errors/isHttpErrorResponse";
import { VoteUtils } from "@/app/shared/helpers/vote-utils";
import { ITopic, TopicState } from "@/app/shared/interfaces";
import { IVote } from "@/app/shared/interfaces/vote.interface";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { VoteService } from "@/app/shared/services/api/vote.service";
import { DialogService } from '@/app/shared/services/core/dialog.service';
import { IpLocationService } from "@/app/shared/services/core/ip-location.service";
import { MetadataService } from "@/app/shared/services/core/metadata.service";
import { NotificationService } from "@/app/shared/services/core/notification.service";
import { SuggestedTopicsService } from "@/app/shared/services/topic/suggested-topics.service";
import { API_URL } from '@/app/shared/tokens/tokens';
import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";
import { injectQuery } from "@tanstack/angular-query-experimental";
import {
    catchError,
    combineLatest,
    EMPTY,
    first,
    lastValueFrom,
    map,
    Observable,
    of,
    switchMap
} from "rxjs";
import { ITopicKeyword } from "../../interfaces/topic-keyword.interface";
import { ReportTopicComponent } from '../../ui/report-topic/report-topic.component';

@Injectable({
    providedIn: "root",
})
export class TopicService {
    private router = inject(Router);
    private voteService = inject(VoteService);
    private pulseService = inject(PulseService);
    private authService = inject(AuthenticationService);
    private settingsService = inject(SettingsService);
    private notificationService = inject(NotificationService);
    private metadataService = inject(MetadataService);
    private suggestedTopicsService = inject(SuggestedTopicsService);
    private ipLocationService = inject(IpLocationService);
    private dialogService = inject(DialogService);

    private readonly apiUrl: string = inject(API_URL);
    private readonly http: HttpClient = inject(HttpClient);

    constructor() {
        effect(() => {
            const topic = this.topicQuery.data();
            if (topic) {
                this.updateMetadata(topic);
            }
        });
    }

    private anonymousUser = toSignal(this.authService.anonymousUser, { initialValue: null });
    private settings = toSignal(this.settingsService.settings$);
    private coordinates = toSignal(this.ipLocationService.countryCoordinates$);

    private topicId = signal<number | null>(null);
    private topicShareKey = signal<string | null>(null);
    private isAnonymousUserVotingInProgressSignal = signal(false);
    private isUpdatedAfterUserSignInSignal = signal(false);
    private topicQuery = injectQuery(() => ({
        queryFn: () => {
            const topicId = this.topicId();
            const topicShareKey = this.topicShareKey();
            const topicIdOrShareKey = topicId || topicShareKey;
            if (topicIdOrShareKey) {
                return this.getTopic(topicIdOrShareKey);
            }
            return null;
        },
        queryKey: [QUERY_KEYS.topic, this.topicId(), this.topicShareKey()],
    }));
    private votesQuery = injectQuery(() => ({
        queryFn: async () => {
            const topicId = this.topicQuery.data()?.id;
            if (!topicId) return null;
            const votes = await lastValueFrom(this.getVotes(topicId));
            return votes;
        },
        queryKey: [QUERY_KEYS.votes, this.topicQuery.data()?.id, this.anonymousUser()],
    }));
    private topicKeywords = computed(() => this.topicQuery.data()?.keywords || []);
    private topicKeywords$ = toObservable(this.topicKeywords);

    public isLoading = computed(() => {
        return this.topicQuery.isLoading();
    });
    public isVotesLoading = computed(() => {
        return this.votesQuery.isLoading();
    });
    public isUpdatedAfterUserSignIn = this.isUpdatedAfterUserSignInSignal.asReadonly();
    public isAnonymousUserVotingInProgress = this.isAnonymousUserVotingInProgressSignal.asReadonly();
    public isAnonymousUser = computed(() => {
        return !!this.anonymousUser();
    });

    public topic = computed(() => {
        const topic = this.topicQuery.data();
        return topic || null;
    });

    public votes = computed(() => {
        const votes = this.votesQuery.data();
        if (votes === null) return null;

        return votes || [];
    });

    public isActiveVote = computed(() => {
        const votes = this.votes();
        const settings = this.settings();

        if (!votes || !settings) return null;
        if (votes.length === 0) return false;

        const lastVote = votes[0];
        const isActive = VoteUtils.isActiveVote(lastVote, settings.minVoteInterval);
        return isActive;
    });

    public lastVoteInfo = computed(() => {
        const votes = this.votes();
        if (votes && votes[0]) {
            return VoteUtils.parseVoteInfo(votes[0]);
        }
        return "";
    });

    public suggestions = toSignal(
        toObservable(this.topicQuery.data).pipe(
            switchMap((topic) => {
                if (!topic?.category) {
                    return of([]);
                }
                this.suggestedTopicsService.topicId = topic.id;
                this.suggestedTopicsService.category = topic.category;
                return this.suggestedTopicsService.suggestedTopics$;
            }),
        ),
        { initialValue: [] as ITopic[] },
    );

    public topicUrl = computed(() => {
        const topic = this.topicQuery.data();
        const settings = this.settings();
        if (topic && settings) {
            return settings.shareTopicBaseUrl + topic.shareKey;
        }
        return "";
    });

    public shortPulseDescription = computed(() => {
        const topic = this.topicQuery.data();
        if (topic) {
            return topic.description.replace(/\n/g, " ");
        }
        return "";
    });

    public isArchived = computed(() => {
        const topic = this.topicQuery.data();
        return topic?.state === TopicState.Archived;
    });

    public lastPulseTime = computed(() => {
        return this.topicQuery.data()?.stats?.timestamp;
    });

    public qrCodePopupText = computed(() => {
        return `Share the '${this.topicQuery.data()?.title}' topic with this QR code.`;
    });

    public qrCodeBannerTitle = computed(() => this.topicQuery.data()?.title || "");

    public qrCodeBannerText = computed(() => this.topicQuery.data()?.description || "");

    public keywords = toSignal(
        combineLatest([this.topicKeywords$, this.pulseService.categories$]).pipe(
            map(([keywords, categories]) => [
                keywords,
                categories.map((category) => category.name),
            ]),
            map(([keywords, categories]) => {
                return keywords.map(
                    (keyword) =>
                        ({
                            label: keyword,
                            type: categories.includes(keyword) ? "static" : "dynamic",
                        }) as ITopicKeyword,
                );
            }),
        ),
        { initialValue: [] as ITopicKeyword[] },
    );

    public mapCenterCoordinates = computed(() => {
        const coordinates = this.coordinates();
        return coordinates
            ? ([coordinates.longitude, coordinates.latitude] as [number, number])
            : AppConstants.MAP_CENTER_COORDINATES;
    });

    public setTopicId(id: number) {
        this.topicId.set(id);
    }

    public setTopicShareKey(shareKey: string) {
        this.topicShareKey.set(shareKey);
    }

    public refreshData() {
        this.topicQuery.refetch();
        this.votesQuery.refetch();
    }

    public setVoteAsExpired() {
        this.votesQuery.refetch();
    }

    public setAsUpdatedAfterUserSignIn() {
        this.isUpdatedAfterUserSignInSignal.set(true);
    }

    public setAnonymousUserVotingInProgress(isInProgress: boolean) {
        this.isAnonymousUserVotingInProgressSignal.set(isInProgress);
    }

    public clearPageData() {
        this.topicId.set(null);
        this.topicShareKey.set(null);
        this.isAnonymousUserVotingInProgressSignal.set(false);
    }

    public updateMetadata(topic: ITopic): void {
        this.metadataService.setTitle(`${topic.title} | Support What Matters – Pulse Up`);
        this.metadataService.setMetaTag(
            "description",
            `Support '${topic.title}' anonymously and see how it’s trending in real time across the map. Track public sentiment and join the pulse.`,
        );
    }

    public showReportPopup(topicId: number) {
        this.dialogService.open(ReportTopicComponent)
            .afterClosed().pipe(first())
            .subscribe(({ reason, description}) => {
                if (reason) {
                    this.report({ topicId, reason, description })
                        .pipe(first())
                        .subscribe({
                            next: () => {
                                this.notificationService.success(
                                    "Thank you for reporting this topic!"
                                );
                            },
                            error: ({ error }) => {
                                const message = error?.title;
                                this.notificationService.error(
                                    '[Report Topic] ' + 
                                        (
                                            message || 
                                            "Failed to report the topic. Please try again later"
                                        ),
                                );
                                
                            }
                        });
                } else {
                    this.notificationService.info("Report cancelled.");
                }
            });
    }

    public report(params: {
        topicId: number;
        reason: string;
        description?: string;
    }): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/topics/report`, {
            topicId: params.topicId,
            reason: params.reason,
            description: params.description,
        });
    }

    public archive(topicId: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/topics/${topicId}/archive`, {});
    }

    private async getTopic(id: string | number) {
        const topic$ = this.pulseService.getById(id).pipe(
            catchError((error: unknown) => {
                if (isHttpErrorResponse(error) && error.status === 404) {
                    this.router.navigateByUrl("/" + AppRoutes.Community.INVALID_LINK);
                }
                return EMPTY;
            }),
        );
        return lastValueFrom(topic$);
    }

    public getVotes(topicId: number): Observable<IVote[] | null> {
        if (!this.authService.userTokenValue) {
            console.log("Anonymous user, skipping vote fetch");
            return of(null);
        }
        const votes$ = this.voteService.getMyVotes({ topicId }).pipe(
            catchError((error: unknown) => {
                console.error("Failed to fetch votes:", error);
                this.notificationService.error(
                    "Failed to fetch your vote. Please reload the page.",
                );
                return of([]);
            }),
        );
        return votes$;
    }
}
