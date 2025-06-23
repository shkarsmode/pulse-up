import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { API_URL } from "../../tokens/tokens";
import { IVote, IGetMyVotesRequest, ISendVoteRequest } from "../../interfaces/vote.interface";

@Injectable({
    providedIn: "root",
})
export class VoteService {
    private readonly apiUrl: string = inject(API_URL);
    private readonly http: HttpClient = inject(HttpClient);

    public getMyVotes(data: IGetMyVotesRequest) {
        return this.http.get<IVote[]>(`${this.apiUrl}/votes/my`, { params: { ...data } });
    }

    public sendVote(data: ISendVoteRequest) {
        return this.http.post<IVote>(`${this.apiUrl}/votes`, data);
    }
}
