import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, tap } from "rxjs";
import { VotingService } from "@/app/shared/services/core/voting.service";
import { delayBetween } from "../helpers/delay-between";

@Injectable()
export class VoteButtonAnimationService {
    private votingService = inject(VotingService);

    private isButtonAnimationInProgress = new BehaviorSubject(false);

    isInProgress$ = this.isButtonAnimationInProgress.asObservable();

    get isInProgressValue() {
        return this.isButtonAnimationInProgress.getValue();
    }

    listenToVotingState() {
        return this.votingService.isVoting$.pipe(
            delayBetween(800),
            tap((isVoting) => {
                this.isButtonAnimationInProgress.next(isVoting);
            }),
        );
    }
}
