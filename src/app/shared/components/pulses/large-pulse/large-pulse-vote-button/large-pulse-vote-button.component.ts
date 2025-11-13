import { isErrorWithMessage } from "@/app/shared/helpers/errors/is-error-with-message";
import { VoteUtils } from "@/app/shared/helpers/vote-utils";
import { ITopic, TopicState } from "@/app/shared/interfaces";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { NotificationService } from "@/app/shared/services/core/notification.service";
import { VotesService } from "@/app/shared/services/votes/votes.service";
import { VotingService } from "@/app/shared/services/votes/voting.service";
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    inject,
    input,
    OnDestroy,
    signal,
} from "@angular/core";
import { takeUntilDestroyed, toObservable, toSignal } from "@angular/core/rxjs-interop";
import { combineLatest, map, Subscription, take, tap } from "rxjs";
import { SecondaryButtonComponent } from "../../../ui-kit/buttons/secondary-button/secondary-button.component";

@Component({
    selector: "app-large-pulse-vote-button",
    standalone: true,
    imports: [SecondaryButtonComponent],
    templateUrl: "./large-pulse-vote-button.component.html",
    styleUrl: "./large-pulse-vote-button.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LargePulseVoteButtonComponent implements OnDestroy {
    public topic = input.required<ITopic>();

    private destroyRef = inject(DestroyRef);
    private votesService = inject(VotesService);
    private votingService = inject(VotingService);
    private notificationService = inject(NotificationService);
    private authService = inject(AuthenticationService);
    private settingsService = inject(SettingsService);

    private subscription: Subscription;
    private isSignedInUserVoted = false;
    private isAnonymousUserVotingInProgress = false;
    private votesByTopicId = toSignal(this.votesService.votesByTopicId$, { initialValue: null });
    private settings = toSignal(this.settingsService.settings$, { initialValue: null });
    private isAuthenticatedUser$ = this.authService.userToken.pipe(
        map((userToken) => {
            return userToken === null ? null : !!userToken;
        }),
    );
    private isAuthenticatedUser = toSignal(this.isAuthenticatedUser$, { initialValue: null });
    private lastVote = computed(() => {
        const topic = this.topic();
        const votesByTopicId = this.votesByTopicId();
        if (!votesByTopicId || !topic) return null;
        const vote = votesByTopicId.get(topic.id);
        return vote || null;
    });
    private isActiveVote = computed(() => {
        const lastVote = this.lastVote();
        const settings = this.settings();
        if (!lastVote || !settings) return null;
        return VoteUtils.isActiveVote(lastVote, settings.minVoteInterval);
    });
    private isActiveVote$ = toObservable(this.isActiveVote);

    public isInProgress = signal(false);
    public isArchived = computed(() => {
        const topic = this.topic();
        return topic?.state === TopicState.Archived;
    });

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    public handleClick(event: MouseEvent) {
        event.stopPropagation();

        if (this.isAuthenticatedUser()) {
            if (this.isActiveVote() === false) {
                this.sendVote();
                this.votingService.lastClickedVoteButtonRef = event.target as HTMLButtonElement;
            }
        } else {
            this.votingService.startVotingForAnonymousUser();
            this.isAnonymousUserVotingInProgress = true;
            combineLatest([this.votingService.isAllowedToVote$, this.isActiveVote$])
                .pipe(
                    tap(([isAllowedToVote, isActiveVote]) => {
                        if (
                            isAllowedToVote &&
                            isActiveVote === false &&
                            !this.isSignedInUserVoted &&
                            this.isAnonymousUserVotingInProgress
                        ) {
                            this.isSignedInUserVoted = true;
                            this.votingService.lastClickedVoteButtonRef = event.target as HTMLButtonElement;
                            this.sendVote();
                        }
                    }),
                    takeUntilDestroyed(this.destroyRef),
                )
                .subscribe();
        }
    }

    private sendVote() {
        if (!this.topic || this.isInProgress()) {
            return;
        }

        this.isInProgress.set(true);

        this.subscription = this.votingService
            .vote({
                topic: this.topic(),
            })
            .pipe(take(1))
            .subscribe({
                next: () => {
                    this.isInProgress.set(false);
                    this.isAnonymousUserVotingInProgress = false;
                },
                error: (error: unknown) => {
                    console.log(error);
                    this.isInProgress.set(false);
                    this.isAnonymousUserVotingInProgress = false;
                    let errorMessage = "Failed to pulse. Please try again.";
                    if (isErrorWithMessage(error)) {
                        errorMessage = error.message;
                    }
                    this.notificationService.error(errorMessage);
                },
            });
    }
}
