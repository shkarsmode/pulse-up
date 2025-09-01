import { computed, effect, inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, EMPTY, lastValueFrom, of, switchMap } from "rxjs";
import { ITopic, TopicState } from "@/app/shared/interfaces";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { isHttpErrorResponse } from "@/app/shared/helpers/errors/isHttpErrorResponse";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";
import { VoteService } from "@/app/shared/services/api/vote.service";
import { NotificationService } from "@/app/shared/services/core/notification.service";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { MetadataService } from "@/app/shared/services/core/metadata.service";
import { VoteUtils } from "@/app/shared/helpers/vote-utils";
import { SuggestedTopicsService } from "@/app/shared/services/topic/suggested-topics.service";
import { QUERY_KEYS } from "@/app/shared/constants";
import { injectQuery } from "@tanstack/angular-query-experimental";

@Injectable({
    providedIn: "root",
})
export class PulsePageService {
    private readonly router = inject(Router);
    private readonly voteService = inject(VoteService);
    private readonly pulseService = inject(PulseService);
    private readonly authService = inject(AuthenticationService);
    private readonly settingsService = inject(SettingsService);
    private readonly notificationService = inject(NotificationService);
    private readonly metadataService = inject(MetadataService);
    private readonly suggestedTopicsService = inject(SuggestedTopicsService);

    constructor() {
        effect(() => {
            const topic = this.topicQuery.data();
            if (topic) {
                this.updateMetadata(topic);
            }
        });
    }

    private settings = toSignal(this.settingsService.settings$);

    private topicId = signal<number | null>(null);
    private topicShareKey = signal<string | null>(null);
    private _isUpdatedAfterUserSignIn = signal(false);
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
        options: {
            refetchOnWindowFocus: false,
        },
    }));
    private votesQuery = injectQuery(() => ({
        queryFn: async () => {
            const topicId = this.topicQuery.data()?.id;
            if (!topicId) return null;
            const votes = await this.getVotes(topicId);
            return votes;
        },
        queryKey: [QUERY_KEYS.votes, this.topicQuery.data()?.id],
        options: {
            refetchOnWindowFocus: false,
        },
    }));

    public isLoading = computed(() => {
        return this.topicQuery.isLoading();
    });
    public isUpdatedAfterUserSignIn = this._isUpdatedAfterUserSignIn.asReadonly();

    public topic = computed(() => {
        const topic = this.topicQuery.data();
        if (!topic) return null;
        const r = this.replaceDescriptionLink(topic);
        return r;
    });

    public vote = computed(() => {
        const votes = this.votesQuery.data();
        const lastVote = votes && votes.length > 0 ? votes[0] : null;
        return lastVote;
    });

    public isActiveVote = computed(() => {
        const vote = this.vote();
        const settings = this.settings();
        if (!vote || !settings) return false;
        return VoteUtils.isActiveVote(vote, settings.minVoteInterval);
    });

    public lastVoteInfo = computed(() => {
        const vote = this.vote();
        if (!vote) return "";
        return VoteUtils.parseVoteInfo(vote);
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
        this._isUpdatedAfterUserSignIn.set(true);
    }

    public clearPageData() {
        this.topicId.set(null);
        this.topicShareKey.set(null);
    }

    public updateMetadata(topic: ITopic): void {
        this.metadataService.setTitle(`${topic.title} | Support What Matters – Pulse Up`);
        this.metadataService.setMetaTag(
            "description",
            `Support '${topic.title}' anonymously and see how it’s trending in real time across the map. Track public sentiment and join the pulse.`,
        );
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

    private async getVotes(topicId: number) {
        if (!this.authService.userTokenValue) {
            console.log("Anonymous user, skipping vote fetch");
            return null;
        }
        const votes$ = this.voteService.getMyVotes({ topicId }).pipe(
            catchError((error: unknown) => {
                console.error("Failed to fetch votes:", error);
                this.notificationService.error(
                    "Failed to fetch your vote. Please reload the page.",
                );
                return of(null);
            }),
        );
        return lastValueFrom(votes$);
    }

    private replaceDescriptionLink(topic: ITopic): ITopic {
        const link = this.extractUrl(topic.description);

        if (!link || !this.topic) return topic;

        const description =
            topic.description.replace(link, "") +
            `<a href="${link}" rel="nofollow" target="_blank">${link}</a>`;
        return { ...topic, description };
    }

    private extractUrl(value: string): string | null {
        // Regular expression to match URLs (basic version)
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const match = value.match(urlRegex);

        // If there's a match, return the first URL, otherwise return null
        return match ? match[0] : null;
    }
}
