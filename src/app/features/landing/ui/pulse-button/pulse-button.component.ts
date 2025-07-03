import { Component, inject, Input, DestroyRef, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SvgIconComponent } from "angular-svg-icon";
import { VotingService } from "@/app/shared/services/core/voting.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
    BehaviorSubject,
    combineLatest,
    delay,
    filter,
    first,
    mergeMap,
    Observable,
    of,
    switchMap,
    tap,
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
    selector: "app-pulse-button",
    standalone: true,
    imports: [
        CommonModule,
        PrimaryButtonComponent,
        SvgIconComponent,
        HeartBeatDirective,
        VoteTimeLeftComponent,
    ],
    templateUrl: "./pulse-button.component.html",
    styleUrl: "./pulse-button.component.scss",
})
export class PulseButtonComponent {
    private destroyRef = inject(DestroyRef);
    private votingService = inject(VotingService);
    private settingsService = inject(SettingsService);
    private notificationService = inject(NotificationService);
    private authService = inject(AuthenticationService);

    @Input() topicId: number | null = null;
    @Input() vote: IVote | null = null;
    @Output() voteExpired = new EventEmitter<void>();
    @Output() voted = new EventEmitter<IVote>();
    @Output() pulse = new EventEmitter<{ justSignedIn?: boolean }>();

    private isVoting = new BehaviorSubject(false);

    isVoting$ = this.isVoting.asObservable();
    isActiveVote = false;
    lastVoteInfo = "";
    isAnonymousUser = this.authService.anonymousUserValue;
    isInProgress = false;

    ngOnInit() {
        this.votingService.isVoting$
            .pipe(
                delayBetween(800),
                tap((isVoting) => {
                    this.isVoting.next(isVoting);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();

        this.listenToUserSignedIn();

        if (!this.vote) return;

        this.isActiveVote =
            !!this.vote && VoteUtils.isActiveVote(this.vote, this.settingsService.minVoteInterval);
        if (this.isActiveVote) {
            this.lastVoteInfo = VoteUtils.parseVoteInfo(this.vote);
        }
    }

    onPulse({ justSignedIn }: { justSignedIn?: boolean } = {}) {
        if (this.isVoting.value || this.isActiveVote || !this.topicId || this.isInProgress) return;

        this.isInProgress = true;

        this.votingService
            .vote({
                topicId: this.topicId,
            })
            .pipe(
                first((vote) => !!vote),
                switchMap((vote) => {
                    // wait for both the vote and isVoting$ to emit
                    return combineLatest([
                        of(vote),
                        this.isVoting$.pipe(filter((value) => value === false)),
                    ]).pipe(first());
                }),
            )
            .subscribe({
                next: ([vote]) => {
                    this.isActiveVote = true;
                    this.lastVoteInfo = VoteUtils.parseVoteInfo(vote);
                    this.voted.emit(vote);
                    this.isInProgress = false;

                    if (justSignedIn) {
                        this.votingService.showSuccessfulVotePopupForJustSignedInUser();
                    }
                },
                error: (error) => {
                    this.isInProgress = false;
                    if (error instanceof VotingError) {
                        if (error.code === VotingErrorCode.NOT_AUTHORIZED) {
                            this.votingService.showAcceptRulesPopup();
                            return;
                        }
                        if (error.code === VotingErrorCode.GEOLOCATION_UNAVAILABLE) {
                            this.votingService.showDownloadAppPopup();
                            return;
                        }
                    }
                    this.notificationService.error(error.message || "Failed to vote");
                },
            });
    }

    onVoteExpired() {
        this.isActiveVote = false;
        this.lastVoteInfo = "";
        this.voteExpired.emit();
    }

    private listenToUserSignedIn() {
        return combineLatest([
            this.authService.user$,
            this.votingService.isAnonymousUserSignedIn$,
        ]).pipe(
            filter(([user, signedIn]) => !!user && signedIn === true),
            first(),
            tap(() => {
                this.votingService.setIsAnonymousUserSignedIn(false);
                this.onPulse({ justSignedIn: true });
            }),
        ).subscribe();
    }
}
