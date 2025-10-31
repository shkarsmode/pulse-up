import { Component, inject, DestroyRef, Output, EventEmitter, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SvgIconComponent } from "angular-svg-icon";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import {
    BehaviorSubject,
    combineLatest,
    delay,
    filter,
    first,
    map,
    mergeMap,
    Observable,
    of,
    switchMap,
    tap,
} from "rxjs";
import { IVote } from "@/app/shared/interfaces/vote.interface";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { NotificationService } from "@/app/shared/services/core/notification.service";
import { VoteTimeLeftComponent } from "../../vote-time-left/vote-time-left.component";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";
import { VotingError, VotingErrorCode } from "@/app/shared/helpers/errors/voting-error";
import { isErrorWithMessage } from "@/app/shared/helpers/errors/is-error-with-message";
import { WaveAnimationDirective } from "@/app/shared/directives/wave-animation/wave-animation.directive";
import { TopicService } from "../../../pages/topic/topic.service";
import { VotingService } from "@/app/shared/services/votes/voting.service";

function delayBetween<T>(delayMs: number, first = false) {
    let past = Date.now();

    return (source: Observable<T>) =>
        source.pipe(
            mergeMap((value, index) => {
                const now = Date.now();
                const delayFor = Math.max(index === 0 && !first ? 0 : past + delayMs - now, 0);
                past = now + delayFor;

                return of(value).pipe(delay(delayFor));
            }),
        );
}

@Component({
    selector: "app-user-vote-button",
    standalone: true,
    imports: [
        CommonModule,
        PrimaryButtonComponent,
        SvgIconComponent,
        VoteTimeLeftComponent,
        WaveAnimationDirective,
    ],
    templateUrl: "./user-vote-button.component.html",
    styleUrl: "./user-vote-button.component.scss",
})
export class UserVoteButtonComponent implements OnInit {
    private destroyRef = inject(DestroyRef);
    private votingService = inject(VotingService);
    private notificationService = inject(NotificationService);
    private authService = inject(AuthenticationService);
    private topicService = inject(TopicService);

    @Output() voteExpired = new EventEmitter<void>();
    @Output() voted = new EventEmitter<IVote>();
    @Output() pulse = new EventEmitter<{ justSignedIn?: boolean }>();

    private isAnimating = new BehaviorSubject(false);
    private topic = this.topicService.topic;
    private isUpdated$ = toObservable(this.topicService.isUpdatedAfterUserSignIn);
    private isActiveVote$ = toObservable(this.topicService.isActiveVote);
    private isAnonymousUserVotingInProgress$ = toObservable(this.topicService.isAnonymousUserVotingInProgress);

    public votes = this.topicService.votes;
    public isVotesLoading = this.topicService.isVotesLoading;
    public isActiveVote = this.topicService.isActiveVote;
    public isAnimating$ = this.isAnimating.asObservable();
    public votes$ = toObservable(this.topicService.votes);
    public isSignedInUserVoted = false;
    public isInProgress = false;

    ngOnInit() {
        this.listenToVotingChanges();
        this.voteAfterAnonymousUserSignIn();
        this.checkShouldVoteAutomatically();
    }

    onClick() {
        this.sendVote({
            onError: this.handleError,
        });
    }

    voteAfterAnonymousUserSignIn() {
        combineLatest([this.listenToUserSignedIn(), this.isActiveVote$, this.isAnonymousUserVotingInProgress$])
            .pipe(
                tap(([isUserSignedIn, isActiveVote, isAnonymousUserVotingInProgress]) => {
                    if (
                        isUserSignedIn &&
                        isActiveVote === false &&
                        !this.isSignedInUserVoted &&
                        isAnonymousUserVotingInProgress
                    ) {
                        this.isSignedInUserVoted = true;
                        this.sendVote({
                            onSuccess: () => {
                                this.votingService.congratulate();
                            },
                            onError: this.handleError,
                        });
                    }
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    voteAfterTopicPublished() {
        this.sendVote();
    }

    onVoteExpired() {
        this.voteExpired.emit();
    }

    private sendVote({
        onSuccess,
        onError,
    }: { onSuccess?: () => void; onError?: (error: unknown) => void } = {}) {
        const topic = this.topic();

        if (this.isAnimating.value || this.isActiveVote() || !topic?.id || this.isInProgress)
            return;

        this.isInProgress = true;

        this.votingService
            .vote({ topic })
            .pipe(
                switchMap((vote) => this.waitForEndOfAnimation(vote)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: ([vote]) => {
                    this.voted.emit(vote);
                    this.isInProgress = false;
                    onSuccess?.();
                },
                error: (error: unknown) => {
                    this.isInProgress = false;
                    onError?.(error);
                },
            });
    }

    private listenToUserSignedIn() {
        return combineLatest([
            this.authService.userToken,
            this.votingService.isAllowedToVote$,
            this.isUpdated$,
        ]).pipe(
            filter(
                ([token, isAllowedToVote, pageUpdated]) =>
                    !!token && isAllowedToVote && pageUpdated,
            ),
            tap(() => {
                this.votingService.setIsAnonymousUserSignedIn(false);
            }),
            map(() => true),
        );
    }

    private checkShouldVoteAutomatically() {
        if (this.votingService.shouldVoteAutomatically) {
            this.votingService.shouldVoteAutomatically = false;
            this.voteAfterTopicPublished();
        }
    }

    private listenToVotingChanges() {
        this.votingService.isVoting$
            .pipe(
                delayBetween(800),
                tap((isVoting) => {
                    this.isAnimating.next(isVoting);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    private waitForEndOfAnimation = (vote: IVote) => {
        // wait for both the vote and isVoting$ to emit
        return combineLatest([
            of(vote),
            this.isAnimating$.pipe(filter((value) => value === false)),
        ]).pipe(first());
    };

    private handleError = (error: unknown) => {
        if (error instanceof VotingError) {
            if (error.code === VotingErrorCode.NOT_AUTHORIZED) {
                this.votingService.startVotingForAnonymousUser();
                return;
            }
            if (error.code === VotingErrorCode.GEOLOCATION_UNAVAILABLE) {
                this.votingService.showDownloadAppPopup();
                return;
            }
        }
        if (isErrorWithMessage(error)) {
            this.notificationService.error(error.message || "Failed to vote");
        }
    };
}
