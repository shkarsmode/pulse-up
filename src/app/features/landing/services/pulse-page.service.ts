import { computed, inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, EMPTY, forkJoin, map, Observable, of, switchMap, tap } from "rxjs";
import { ITopic, TopicState } from "@/app/shared/interfaces";
import { IVote } from "@/app/shared/interfaces/vote.interface";
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

    private settings = toSignal(this.settingsService.settings$);

    private _topic = signal<ITopic | null>(null);
    private _vote = signal<IVote | null>(null);
    private _isLoading = signal(true);
    private _isUpdatedAfterUserSignIn = signal(false);

    public topic = this._topic.asReadonly();
    public vote = this._vote.asReadonly();
    public isLoading = this._isLoading.asReadonly();
    public isUpdatedAfterUserSignIn = this._isUpdatedAfterUserSignIn.asReadonly();

    public isActiveVote = computed(() => {
        const vote = this._vote();
        const settings = this.settings();
        if (!vote || !settings) return false;
        return VoteUtils.isActiveVote(vote, settings.minVoteInterval);
    });

    public lastVoteInfo = computed(() => {
        const vote = this._vote();
        if (!vote) return "";
        return VoteUtils.parseVoteInfo(vote);
    });

    public suggestions = toSignal(
        toObservable(this._topic).pipe(
            switchMap((topic) => {
                if (!topic?.category) {
                    return of([]);
                }
                return this.pulseService.get({
                    category: topic.category,
                    take: 3,
                });
            }),
        ),
        { initialValue: [] as ITopic[] },
    );

    public topicUrl = computed(() => {
        const topic = this._topic();
        const settings = this.settings();
        if (topic && settings) {
            return settings.shareTopicBaseUrl + topic.shareKey;
        }
        return "";
    });

    public shortPulseDescription = computed(() => {
        const topic = this._topic();
        if (topic) {
            return topic.description.replace(/\n/g, " ");
        }
        return "";
    });

    public isArchived = computed(() => {
        const topic = this._topic();
        return topic?.state === TopicState.Archived;
    });

    public updatePageData({ topicId, shareKey = "" }: { topicId?: number; shareKey?: string }) {
        if (!topicId && !shareKey) return EMPTY;
        
        this._isLoading.set(true);
        this.clearPageData();

        if (topicId) {
            return forkJoin({
                topic: this.getTopic(topicId),
                votes: this.getVotes(topicId),
            }).pipe(
                tap(({ topic, votes }) => {
                    const lastVote = votes && votes.length > 0 ? votes[0] : null;
                    this._topic.set(topic);
                    this._vote.set(lastVote);
                    this.updateMetadata(topic);
                    this._isLoading.set(false);
                    this.createLink(topic);
                }),
                catchError(() => {
                    this._isLoading.set(false);
                    return EMPTY;
                }),
            );
        } else {
            return this.getTopic(shareKey).pipe(
                tap((topic) => {
                    this._topic.set(topic);
                    this.updateMetadata(topic);
                    this.createLink(topic);
                }),
                switchMap((topic) => {
                    return this.getVotes(topic.id).pipe(
                        tap((votes) => {
                            const lastVote = votes && votes.length > 0 ? votes[0] : null;
                            this._vote.set(lastVote);
                            this._isLoading.set(false);
                        }),
                        map((votes) => ({
                            topic,
                            votes,
                        })),
                        catchError(() => {
                            this._isLoading.set(false);
                            return EMPTY;
                        }),
                    );
                }),
            );
        }
    }

    public setVoteAsExpired() {
        this._vote.set(null);
    }

    public setAsUpdatedAfterUserSignIn() {
        this._isUpdatedAfterUserSignIn.set(true);
    }

    public clearPageData() {
        this._topic.set(null);
        this._vote.set(null);
        this._isLoading.set(true);
    }

    private getTopic(id: string | number): Observable<ITopic> {
        return this.pulseService.getById(id).pipe(
            catchError((error: unknown) => {
                if (isHttpErrorResponse(error) && error.status === 404) {
                    this.router.navigateByUrl("/" + AppRoutes.Community.INVALID_LINK);
                }
                return EMPTY;
            }),
        );
    }

    private getVotes(topicId: number): Observable<IVote[] | null> {
        if (!this.authService.userTokenValue) {
            console.log("Anonymous user, skipping vote fetch");
            return of(null);
        }
        return this.voteService.getMyVotes({ topicId }).pipe(
            catchError((error: unknown) => {
                console.error("Failed to fetch votes:", error);
                this.notificationService.error(
                    "Failed to fetch your vote. Please reload the page.",
                );
                return of(null);
            }),
        );
    }

    private updateMetadata(topic: ITopic): void {
        this.metadataService.setTitle(`${topic.title} | Support What Matters – Pulse Up`);
        this.metadataService.setMetaTag(
            "description",
            `Support '${topic.title}' anonymously and see how it’s trending in real time across the map. Track public sentiment and join the pulse.`,
        );
    }

    private createLink(topic: ITopic): void {
        const link = this.extractUrl(topic.description);

        if (!link || !this.topic) return;

        const description = topic.description.replace(link, "") + `<a href="${link}" rel="nofollow" target="_blank">${link}</a>`;
        this._topic.set({ ...topic, description });
    }

    private extractUrl(value: string): string | null {
        // Regular expression to match URLs (basic version)
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const match = value.match(urlRegex);

        // If there's a match, return the first URL, otherwise return null
        return match ? match[0] : null;
    }
}
