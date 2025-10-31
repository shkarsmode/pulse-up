import { DestroyRef, inject, Injectable } from "@angular/core";
import {
    BehaviorSubject,
    catchError,
    combineLatest,
    distinctUntilChanged,
    from,
    switchMap,
    take,
    tap,
    throwError,
} from "rxjs";
import { GeolocationService } from "../core/geolocation.service";
import { AuthenticationService } from "../api/authentication.service";
import { VotingError, VotingErrorCode } from "../../helpers/errors/voting-error";
import { VoteService } from "../api/vote.service";
import { WelcomePopupComponent } from "@/app/features/landing/ui/welcome-popup/welcome-popup.component";
import { DownloadAppPopupComponent } from "@/app/features/landing/ui/download-app-popup/download-app-popup.component";
import { SuccessfulVotePopupComponent } from "@/app/features/landing/ui/successful-vote-popup/successful-vote-popup.component";
import { AcceptRulesPopupComponent } from "@/app/features/landing/ui/accept-rules-popup/accept-rules-popup.component";
import { ConfirmPhoneNumberPopupComponent } from "@/app/features/landing/ui/confirm-phone-number-popup/confirm-phone-number-popup.component";
import { SigninRequiredPopupComponent } from "../../components/popups/signin-required-popup/signin-required-popup.component";
import { DialogService } from "../core/dialog.service";
import { VotesService } from "./votes.service";
import { ITopic } from "../../interfaces";
import { PendingTopicsService } from "../topic/pending-topics.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Injectable({
    providedIn: "root",
})
export class VotingService {
    private destroyRef = inject(DestroyRef);
    private dialogService = inject(DialogService);
    private geolocationService = inject(GeolocationService);
    private authService = inject(AuthenticationService);
    private pendingTopicsService = inject(PendingTopicsService);
    private voteService = inject(VoteService);
    private votesService = inject(VotesService);
    private isVoting = new BehaviorSubject(false);
    private isAnonymousUserSignedIn = new BehaviorSubject(false);
    private isGeolocationRetrieved = new BehaviorSubject(false);
    private isAllowedToVote = new BehaviorSubject(false);

    public isVoting$ = this.isVoting.asObservable();
    public isAllowedToVote$ = this.isAllowedToVote.asObservable();
    public shouldVoteAutomatically = false;

    get anonymousUserValue() {
        return this.authService.anonymousUserValue;
    }
    get userTokenValue() {
        return this.authService.userTokenValue;
    }

    constructor() {
        this.isAnonymousUserSignedIn
            .pipe(
                distinctUntilChanged(),
                tap((isSignedIn) => {
                    if (isSignedIn) {
                        const hasPermission = this.geolocationService.checkGeolocationPermission();
                        if (hasPermission) {
                            this.isGeolocationRetrieved.next(true);
                        } else {
                            this.showAcceptRulesPopup();
                        }
                    } else {
                        this.isGeolocationRetrieved.next(false);
                    }
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();

        combineLatest([this.isAnonymousUserSignedIn, this.isGeolocationRetrieved])
            .pipe(
                tap(([isSignedIn, isGeolocationRetrieved]) => {
                    this.isAllowedToVote.next(isSignedIn && isGeolocationRetrieved);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    setIsAnonymousUserSignedIn(value: boolean) {
        this.isAnonymousUserSignedIn.next(value);
    }

    setIsGeolocationRetrieved(value: boolean) {
        this.isGeolocationRetrieved.next(value);
    }

    vote({ topic }: { topic: ITopic }) {
        if (this.anonymousUserValue || (!this.anonymousUserValue && !this.userTokenValue)) {
            return throwError(
                () =>
                    new VotingError("You need to sign in to pulse", VotingErrorCode.NOT_AUTHORIZED),
            );
        }

        this.isVoting.next(true);

        return from(this.geolocationService.getCurrentGeolocationAsync()).pipe(
            catchError(() => {
                this.isVoting.next(false);
                return throwError(
                    () =>
                        new VotingError(
                            "Failed to retrieve geolocation. Location access may be disabled or unavailable.",
                            VotingErrorCode.GEOLOCATION_UNAVAILABLE,
                        ),
                );
            }),
            switchMap((geolocation) => {
                return this.voteService.sendVote({
                    topicId: topic.id,
                    location: {
                        latitude: geolocation.geolocationPosition.coords.latitude,
                        longitude: geolocation.geolocationPosition.coords.longitude,
                    },
                    locationName: geolocation.details.fullname,
                });
            }),
            tap((vote) => {
                this.votesService.addVote(vote);
                this.pendingTopicsService.add(topic);
                this.isVoting.next(false);
            }),
            catchError((error: unknown) => {
                this.isVoting.next(false);
                if (error instanceof VotingError) {
                    return throwError(() => error);
                }
                return throwError(
                    () => new VotingError("Failed to vote", VotingErrorCode.UNKNOWN_ERROR),
                );
            }),
        );
    }

    startVotingForAnonymousUser() {
        this.showWelcomePopup();
    }

    confirmPhoneNumber() {
        this.showConfirmPhoneNumberPopup();
    }

    reauthenticate() {
        this.showRecentSignInRequiredPopup();
    }

    congratulate() {
        this.showSuccessfulVotePopupForJustSignedInUser();
    }

    showDownloadAppPopup() {
        this.dialogService.open(DownloadAppPopupComponent);
    }

    backToWelcomePopup() {
        this.showWelcomePopup();
    }

    private showAcceptRulesPopup() {
        setTimeout(() => {
            this.dialogService.open(AcceptRulesPopupComponent);
        }, 400);
    }

    private showWelcomePopup() {
        const dialogRef = this.dialogService.open(WelcomePopupComponent);
        dialogRef
            .afterClosed()
            .pipe(take(1))
            .subscribe();
    }

    private showConfirmPhoneNumberPopup() {
        const dialogRef = this.dialogService.open(ConfirmPhoneNumberPopupComponent);
        dialogRef
            .afterClosed()
            .pipe(take(1))
            .subscribe((result) => {
                if (result?.stopSignInprocess) {
                    this.authService.stopSignInProcess();
                }
            });
    }

    private showSuccessfulVotePopupForJustSignedInUser() {
        this.dialogService.open(SuccessfulVotePopupComponent);
    }

    private showRecentSignInRequiredPopup() {
        this.dialogService.open(SigninRequiredPopupComponent);
    }
}
