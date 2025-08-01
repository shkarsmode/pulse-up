import { Injectable, inject } from "@angular/core";
import {
    Observable,
    defer,
    of,
    concatMap,
    expand,
    map,
    reduce,
    shareReplay,
    takeWhile,
    BehaviorSubject,
    tap,
} from "rxjs";
import { VoteService } from "../api/vote.service";
import { IVote } from "../../interfaces/vote.interface";

@Injectable({
    providedIn: "root",
})
export class VotesService {
    private readonly voteService = inject(VoteService);

    private readonly votesSubject = new BehaviorSubject<IVote[]>([]);
    public readonly votes$: Observable<IVote[]> = this.votesSubject.asObservable();
    public readonly votesByTopicId$ = this.votes$.pipe(
        map((votes) => {
            const map = new Map<number, IVote>();
            votes.forEach((vote) => {
                if (!map.has(vote.topicId)) {
                    map.set(vote.topicId, vote);
                }
            });
            return map;
        }),
    );

    private initialized = false;

    constructor() {
        this.loadAllVotes();
    }

    private loadAllVotes(): void {
        if (this.initialized) return;
        this.initialized = true;

        const take = 500;
        let skip = 0;

        this.voteService
            .getMyVotes({ take, skip })
            .pipe(
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
        const currentVotes = this.votesSubject.getValue();
        this.votesSubject.next([vote, ...currentVotes]);
    }
}
