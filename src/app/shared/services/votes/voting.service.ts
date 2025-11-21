import { AcceptRulesPopupComponent } from "@/app/features/landing/ui/accept-rules-popup/accept-rules-popup.component";
import { ConfirmPhoneNumberPopupComponent } from "@/app/features/landing/ui/confirm-phone-number-popup/confirm-phone-number-popup.component";
import { DownloadAppPopupComponent } from "@/app/features/landing/ui/download-app-popup/download-app-popup.component";
import { FallbackDetermineLocationComponent } from '@/app/features/landing/ui/fallback-determine-location/fallback-determine-location.component';
import { SuccessfulVotePopupComponent } from "@/app/features/landing/ui/successful-vote-popup/successful-vote-popup.component";
import { WelcomePopupComponent } from "@/app/features/landing/ui/welcome-popup/welcome-popup.component";
import { TopicLocation } from '@/app/features/user/interfaces/topic-location.interface';
import { DestroyRef, inject, Injectable } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
    BehaviorSubject,
    catchError,
    combineLatest,
    distinctUntilChanged,
    first,
    from,
    Observable,
    of,
    switchMap,
    take,
    tap,
    throwError
} from "rxjs";
import { SigninRequiredPopupComponent } from "../../components/popups/signin-required-popup/signin-required-popup.component";
import { VotingError, VotingErrorCode } from "../../helpers/errors/voting-error";
import { IGeolocation, ITopic } from "../../interfaces";
import { AuthenticationService } from "../api/authentication.service";
import { VoteService } from "../api/vote.service";
import { DialogService } from "../core/dialog.service";
import { GeolocationService } from "../core/geolocation.service";
import { PendingTopicsService } from "../topic/pending-topics.service";
import { VotesService } from "./votes.service";

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
    public lastClickedVoteButtonRef: HTMLButtonElement | null = null;

    public fallbackDeterminedUserLocation: TopicLocation | null = null;

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
                            this.fallbackDeterminedUserLocation = null;
                            this.isGeolocationRetrieved.next(true);
                        } else {
                            // this.showAcceptRulesPopup();
                            this.showFallbackDetermineLocationPopup();
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
        if (!this.anonymousUserValue && !this.userTokenValue) {
            return throwError(
                () =>
                    new VotingError("You need to sign in to pulse", VotingErrorCode.NOT_AUTHORIZED),
            );
        }

        this.isVoting.next(true);

        return from(
                this.geolocationService.getCurrentGeolocationAsync()
        ).pipe(
            catchError((): Observable<IGeolocation> => {
                if (!this.fallbackDeterminedUserLocation) {
                    this.isVoting.next(false);
                    return throwError(
                        () =>
                            new VotingError(
                                "Failed to retrieve geolocation. Location access may be disabled or unavailable.",
                                VotingErrorCode.GEOLOCATION_UNAVAILABLE,
                            ),
                    );
                }
                return of({ 
                    geolocationPosition: { 
                        coords: { 
                            latitude: this.fallbackDeterminedUserLocation.lat,
                            longitude: this.fallbackDeterminedUserLocation.lng
                        } 
                    },
                    details: { ...this.fallbackDeterminedUserLocation },
                    fallback: true
                }) as Observable<IGeolocation>
            }),
            switchMap((geolocation: any) => {
                console.log('[VotingService] Geolocation: ', geolocation);
                console.log(
                    '[VotingService] Geolocation type: ', 
                    geolocation?.fallback ? 'unverified location' : 'verified location'
                );
                return this.voteService.sendVote({
                    topicId: topic.id,
                    location: {
                        latitude: geolocation.geolocationPosition.coords.latitude,
                        longitude: geolocation.geolocationPosition.coords.longitude,
                    },
                    locationName: geolocation.details.fullname,
                    // type: geolocation?.fallback ? 'unverified location' : 'verified location',
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
        )
        
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

    public showFallbackDetermineLocationPopup(): void {
        setTimeout(() => {
            this.dialogService.open(FallbackDetermineLocationComponent)
                .afterClosed()
                .pipe(first())
                .subscribe(result => {
                    this.fallbackDeterminedUserLocation = result;
                    if (this.lastClickedVoteButtonRef) {
                        this.lastClickedVoteButtonRef.click();
                    } else {
                        (document.querySelector('.pulse-button > button') as HTMLButtonElement)
                            ?.click();
                    }
                    this.lastClickedVoteButtonRef = null;
                })
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
