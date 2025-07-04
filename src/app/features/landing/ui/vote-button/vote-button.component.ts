import { Component, inject, Input, DestroyRef, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SvgIconComponent } from "angular-svg-icon";
import { VotingService } from "@/app/shared/services/core/voting.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
    catchError,
    combineLatest,
    filter,
    first,
    map,
    Observable,
    of,
    switchMap,
    tap,
    throwError,
} from "rxjs";
import { IVote } from "@/app/shared/interfaces/vote.interface";
import { HeartBeatDirective } from "@/app/shared/animations/heart-beat.directive";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";
import { VoteUtils } from "@/app/shared/helpers/vote-utils";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { NotificationService } from "@/app/shared/services/core/notification.service";
import { VoteTimeLeftComponent } from "../vote-time-left/vote-time-left.component";
import { AuthenticationService } from "@/app/shared/services/api/authentication.service";
import { VotingError, VotingErrorCode } from "@/app/shared/helpers/errors/voting-error";
import { VoteButtonAnimationService } from "../../services/vote-button-animation.service";
import { isErrorWithMessage } from "@/app/shared/helpers/errors/is-error-with-message";
import { PulseService } from "@/app/shared/services/api/pulse.service";

@Component({
    selector: "app-vote-button",
    standalone: true,
    imports: [
        CommonModule,
        PrimaryButtonComponent,
        SvgIconComponent,
        HeartBeatDirective,
        VoteTimeLeftComponent,
    ],
    providers: [VoteButtonAnimationService],
    templateUrl: "./vote-button.component.html",
    styleUrl: "./vote-button.component.scss",
})
export class VoteButtonComponent {
    private readonly destroyRef = inject(DestroyRef);
    private readonly votingService = inject(VotingService);
    private readonly settingsService = inject(SettingsService);
    private readonly notificationService = inject(NotificationService);
    private readonly authService = inject(AuthenticationService);
    private readonly pulseService = inject(PulseService);
    public readonly animationService = inject(VoteButtonAnimationService);

    @Input() topicId: number | null = null;
    @Input() vote: IVote | null = null;
    @Output() voteExpired = new EventEmitter<void>();
    @Output() voted = new EventEmitter<IVote>();
    @Output() pulse = new EventEmitter<{ justSignedIn?: boolean }>();

    isActiveVote = false;
    lastVoteInfo = "";
    isAnonymousUser = this.authService.anonymousUserValue;
    isInProgress = false;

    ngOnInit() {
        this.animationService
            .listenToVotingState()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe();

        this.listenToUserSignedIn();
        this.voteOnJustCreatedTopic();

        if (!this.vote) return;

        this.isActiveVote =
            !!this.vote && VoteUtils.isActiveVote(this.vote, this.settingsService.minVoteInterval);
        if (this.isActiveVote) {
            this.lastVoteInfo = VoteUtils.parseVoteInfo(this.vote);
        }
    }

    onPulse({ justSignedIn }: { justSignedIn?: boolean } = {}) {
        if (
            this.animationService.isInProgressValue ||
            this.isActiveVote ||
            !this.topicId ||
            this.isInProgress
        ) {
            return;
        }

        this.isInProgress = true;

        this.votingService
            .vote({
                topicId: this.topicId,
            })
            .pipe(this.waitForVoteAndAnimationFinish)
            .pipe(
                catchError((error) => this.handleVotingError(error)),
                map(([vote]) => vote),
                tap(this.updateVoteInfo),
                tap((vote) => {
                    this.voted.emit(vote);
                    this.isInProgress = false;
                }),
                tap(() => {
                    if (justSignedIn) {
                        this.congratulateJustSignedInUser();
                    }
                }),
            )
            .subscribe();
    }

    private voteOnJustCreatedTopic() {
        if (
            !this.pulseService.isJustCreatedTopic ||
            this.animationService.isInProgressValue ||
            this.isActiveVote ||
            !this.topicId ||
            this.isInProgress
        ) {
            return;
        }

        this.isInProgress = true;

        this.votingService
            .vote({
                topicId: this.topicId,
            })
            .pipe(this.waitForVoteAndAnimationFinish)
            .pipe(
                map(([vote]) => vote),
                tap(this.updateVoteInfo),
                tap((vote) => {
                    this.voted.emit(vote);
                    this.isInProgress = false;
                }),
            )
            .subscribe();
    }

    onVoteExpired() {
        this.isActiveVote = false;
        this.lastVoteInfo = "";
        this.voteExpired.emit();
    }

    private waitForVoteAndAnimationFinish = (vote$: Observable<IVote>) => {
        // wait for both the vote and isButtonAnimationInProgress$ to emit
        return vote$.pipe(
            first((vote) => !!vote),
            switchMap((vote) => {
                return combineLatest([
                    of(vote),
                    this.animationService.isInProgress$.pipe(filter((value) => value === false)),
                ]).pipe(first());
            }),
        );
    };

    private updateVoteInfo = (vote: IVote) => {
        this.isActiveVote = true;
        this.lastVoteInfo = VoteUtils.parseVoteInfo(vote);
        this.voted.emit(vote);
        this.isInProgress = false;
    };

    private congratulateJustSignedInUser() {
        this.votingService.congratulate();
    }

    private listenToUserSignedIn() {
        return combineLatest([
            this.authService.firebaseUser$,
            this.votingService.isAnonymousUserSignedIn$,
        ])
            .pipe(
                filter(([user, signedIn]) => !!user && signedIn === true),
                first(),
                tap(() => {
                    this.votingService.setIsAnonymousUserSignedIn(false);

                    if (this.votingService.isGeolocationRetrieved) {
                        this.onPulse({ justSignedIn: true });
                    }
                }),
            )
            .subscribe();
    }

    private handleVotingError(error: unknown) {
        if (error instanceof VotingError) {
            if (error.code === VotingErrorCode.NOT_AUTHORIZED) {
                this.votingService.startVotingForAnonymousUser();
            } else if (error.code === VotingErrorCode.GEOLOCATION_UNAVAILABLE) {
                this.votingService.showDownloadAppPopup();
            }
        } else if (isErrorWithMessage(error)) {
            this.notificationService.error(error.message || "Failed to vote");
        }
        return throwError(() => error);
    }
}
