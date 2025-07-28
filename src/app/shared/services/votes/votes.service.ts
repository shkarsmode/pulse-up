import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, firstValueFrom } from "rxjs";
import { IVote } from "../../interfaces/vote.interface";
import { VoteService } from "../api/vote.service";

@Injectable({
    providedIn: "root",
})
export class VotesService {
    private voteService = inject(VoteService);

    private votes = new BehaviorSubject<IVote[]>([]);
    private votesByTopicId = new BehaviorSubject<Map<number, IVote>>(new Map());
    private loaded = new BehaviorSubject<boolean>(false);
    public votes$ = this.votes.asObservable();
    public votesByTopicId$ = this.votesByTopicId.asObservable();
    public loaded$ = this.loaded.asObservable();

    public async updateVotes(): Promise<void> {
        this.loaded.next(false);
        const take = 500;
        let skip = 0;
        let allVotes: IVote[] = [];

        try {
            while (true) {
                const votes = await firstValueFrom(this.voteService.getMyVotes({ take, skip }));
                allVotes = [...allVotes, ...votes];

                if (votes.length < take) {
                    break;
                }

                skip += take;
            }

            this.votes.next(allVotes);

            const voteMap = new Map<number, IVote>();
            allVotes.forEach((vote) => {
                if (!voteMap.has(vote.topicId)) {
                    voteMap.set(vote.topicId, vote);
                }
            });
            this.votesByTopicId.next(voteMap);
            this.loaded.next(true);
        } catch (err) {
            console.error("Failed to fetch votes", err);
        }
    }

    public clearVotes(): void {
        this.votes.next([]);
        this.votesByTopicId.next(new Map());
        this.loaded.next(false);
    }
}
