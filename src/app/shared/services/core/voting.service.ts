import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, catchError, switchMap, tap, throwError } from "rxjs";
import { GeolocationService } from "./geolocation.service";
import { AuthenticationService } from "../api/authentication.service";
import { VotingError, VotingErrorCode } from "../../helpers/errors/voting-error";
import { VoteService } from "../api/vote.service";

@Injectable({
    providedIn: "root",
})
export class VotingService {
    private geolocationService = inject(GeolocationService);
    private authService = inject(AuthenticationService);
    private voteService = inject(VoteService);
    private isVotingSubject = new BehaviorSubject<boolean>(false);

    isVoting$ = this.isVotingSubject.asObservable();
    get anonymousUserValue() {
        return this.authService.anonymousUserValue
    };
    get userTokeenValue() {
        return this.authService.userTokenValue;
    }

    vote({ topicId }: { topicId: number }) {
        if (this.anonymousUserValue || (!this.anonymousUserValue && !this.userTokeenValue)) {
            return throwError(
                () =>
                    new VotingError("You need to sign in to pulse", VotingErrorCode.NOT_AUTHORIZED),
            );
        }

        this.isVotingSubject.next(true);

        return this.geolocationService
            .getCurrentGeolocation({
                enableHighAccuracy: false,
            })
            .pipe(
                catchError(() => {
                    this.isVotingSubject.next(false);
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
                tap(() => this.isVotingSubject.next(false)),
                catchError((error) => {
                    this.isVotingSubject.next(false);
                    if (error instanceof VotingError) {
                        return throwError(() => error);
                    }
                    return throwError(
                        () => new VotingError("Failed to vote", VotingErrorCode.UNKNOWN_ERROR),
                    );
                }),
            );
    }
}
