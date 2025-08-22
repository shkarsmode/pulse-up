import { DestroyRef, Injectable, inject } from "@angular/core";
import {
    Observable,
    of,
    expand,
    map,
    reduce,
    takeWhile,
    BehaviorSubject,
    tap,
    catchError,
    distinctUntilChanged,
} from "rxjs";
import { VoteService } from "../api/vote.service";
import { IVote } from "../../interfaces/vote.interface";
import { AuthenticationService } from "../api/authentication.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Injectable({
    providedIn: "root",
})
export class VotesService {
    private readonly destroyRef = inject(DestroyRef);
    private readonly voteService = inject(VoteService);
    private readonly authenticationService = inject(AuthenticationService);

    private initialized = false;
    private readonly votesSubject = new BehaviorSubject<IVote[] | null>(null);
    public readonly votes$: Observable<IVote[] | null> = this.votesSubject.asObservable();
    public readonly votesByTopicId$ = this.votes$.pipe(
        map((votes) => {
            if (!votes) return null;
            const map = new Map<number, IVote>();
            votes.forEach((vote) => {
                if (!map.has(vote.topicId)) {
                    map.set(vote.topicId, vote);
                }
            });
            return map;
        }),
    );

    constructor() {
        this.authenticationService.userToken
            .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
            .subscribe((token) => {
                if (token) {
                    this.loadAllVotes();
                } else {
                    this.clearVotes();
                }
            });
    }

    private loadAllVotes(): void {
        if (this.initialized) return;
        this.initialized = true;

        const take = 500;
        let skip = 0;

        this.voteService
            .getMyVotes({ take, skip })
            .pipe(
                catchError(() => of([])),
                expand((batch) => {
                    if (batch.length < take) {
                        return of([]);
                    }
                    skip += take;
                    return this.voteService.getMyVotes({ take, skip });
                }),
                takeWhile((batch) => batch.length > 0, true),
                reduce((acc, batch) => [...acc, ...batch], [] as IVote[]),
                tap((allVotes) => this.votesSubject.next(allVotes)),
            )
            .subscribe();
    }

    public addVote(vote: IVote): void {
        const currentVotes = this.votesSubject.getValue() || [];
        this.votesSubject.next([vote, ...currentVotes]);
    }

    private clearVotes(): void {
        this.initialized = false;
        this.votesSubject.next(null);
    }
}
