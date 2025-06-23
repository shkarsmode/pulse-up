export interface IVote {
    id: number;
    topicId: number;
    location: string;
    updatedAt: string;
}

export interface IGetMyVotesRequest {
    take?: number;
    skip?: number;
    topicId?: number;
    after?: string;
}

export interface ISendVoteRequest {
    topicId: number;
    location: {
        latitude: number;
        longitude: number;
    };
    locationName: string;
}
