import { LocationSource } from '../enums/location-source.enum';
export interface IVote {
    id: string;
    topicId: number;
    location: string;
    updatedAt: string;
    locationSource: LocationSource;
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
    locationSource: LocationSource | undefined;
}
