import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, catchError, switchMap, tap, throwError } from "rxjs";
import { GeolocationService } from "./geolocation.service";
import { AuthenticationService } from "../api/authentication.service";
import { VotingError, VotingErrorCode } from "../../helpers/errors/voting-error";
import { VoteService } from "../api/vote.service";
import { WelcomePopupComponent } from "@/app/features/landing/ui/welcome-popup/welcome-popup.component";
import { DownloadAppPopupComponent } from "@/app/features/landing/ui/download-app-popup/download-app-popup.component";
import { SuccessfulVotePopupComponent } from "@/app/features/landing/ui/successful-vote-popup/successful-vote-popup.component";
import { AcceptRulesPopupComponent } from "@/app/features/landing/ui/accept-rules-popup/accept-rules-popup.component";
import { ConfirmPhoneNumberPopupComponent } from "@/app/features/landing/ui/confirm-phone-number-popup/confirm-phone-number-popup.component";
import { SigninRequiredPopupComponent } from "../../components/popups/signin-required-popup/signin-required-popup.component";
import { DialogService } from "./dialog.service";
import { GetLocationPopupComponent } from "@/app/features/landing/ui/get-location-popup/get-location-popup.component";

@Injectable({
    providedIn: "root",
})
export class VotingService {
    private dialogService = inject(DialogService);
    private geolocationService = inject(GeolocationService);
    private authService = inject(AuthenticationService);
    private voteService = inject(VoteService);
    private isVoting = new BehaviorSubject(false);
    private isAnonymousUserSignedIn = new BehaviorSubject(false);

    isVoting$ = this.isVoting.asObservable();
    isAnonymousUserSignedIn$ = this.isAnonymousUserSignedIn.asObservable();
    isGeolocationRetrieved = false;
    shouldVoteAutomatically = false;
    
    get anonymousUserValue() {
        return this.authService.anonymousUserValue;
    }
    get userTokenValue() {
        return this.authService.userTokenValue;
    }
    setIsAnonymousUserSignedIn(value: boolean) {
        if (value === this.isAnonymousUserSignedIn.value) return;
        this.isAnonymousUserSignedIn.next(value);
    }

    vote({ topicId }: { topicId: number }) {
        if (this.anonymousUserValue || (!this.anonymousUserValue && !this.userTokenValue)) {
            return throwError(
                () =>
                    new VotingError("You need to sign in to pulse", VotingErrorCode.NOT_AUTHORIZED),
            );
        }

        this.isVoting.next(true);

        return this.geolocationService.getCurrentGeolocation({ enableHighAccuracy: false }).pipe(
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
                    topicId,
                    location: {
                        latitude: geolocation.geolocationPosition.coords.latitude,
                        longitude: geolocation.geolocationPosition.coords.longitude,
                    },
                    locationName: geolocation.details.fullname,
                });
            }),
            tap(() => this.isVoting.next(false)),
            catchError((error) => {
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
        this.showAcceptRulesPopup();
    }

    askForGeolocation() {
        this.showGetGeolocationPopup();
    }

    signInWithGeolocation() {
        this.isGeolocationRetrieved = true;
        this.showWelcomePopup();
    }

    signInWithoutGeolocation() {
        this.isGeolocationRetrieved = false;
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
        this.showWelcomePopup()
    }

    private showAcceptRulesPopup() {
        this.dialogService.open(AcceptRulesPopupComponent);
    }

    private showGetGeolocationPopup() {
        this.dialogService.open(GetLocationPopupComponent, {
            disableClose: true,
        });
    }

    private showWelcomePopup() {
        const dialogRef = this.dialogService.open(WelcomePopupComponent);
        dialogRef.afterClosed().subscribe((result) => {
            if (result?.stopSignInProcess) {
                this.isGeolocationRetrieved = false;
            }
        });
    }

    private showConfirmPhoneNumberPopup() {
        const dialogRef = this.dialogService.open(ConfirmPhoneNumberPopupComponent);
         dialogRef.afterClosed().subscribe((result) => {
            if (result?.stopSignInprocess) {
                this.authService.stopSignInProcess();
                this.isGeolocationRetrieved = false;
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
