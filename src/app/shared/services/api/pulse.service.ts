import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of, shareReplay, tap } from "rxjs";
import { ITopic, TopicState } from "../../interfaces";
import { API_URL } from "../../tokens/tokens";
import { IValidateTopicTitleResponse } from "../../interfaces/validate-topic-title.response";
import { ICategory } from "../../interfaces/category.interface";
import { PendingTopicsService } from "../topic/pending-topics.service";
import { IH3Pulses } from "@/app/features/landing/helpers/interfaces/h3-pulses.interface";
import { IH3Votes } from "@/app/shared/interfaces/map/h3-votes.interface";
import { IGetLeaderboardTopicsRequest } from "../../interfaces/topic/get-leaderboard-topics-request.interface";
import { IGetLeaderboardTopicsResponse } from "../../interfaces/topic/get-leaderboard-topics-response.interface";

type RequestParams = Record<
    string,
    string | number | boolean | readonly (string | number | boolean)[]
>;

@Injectable({
    providedIn: "root",
})
export class PulseService {
    public latestAppVersionNumber: number;
    public currentHeatmapDepth = 3;
    public actualTopicsImageKeyMap: Record<string, string> = {};
    public isJustCreatedTopic = false;

    private readonly apiUrl: string = inject(API_URL);
    private readonly http: HttpClient = inject(HttpClient);
    private categories$?: Observable<ICategory[]>;
    private readonly pendingTopicsService = inject(PendingTopicsService);

    public get(
        params: {
            keyword?: string;
            category?: string;
            country?: string;
            state?: string;
            city?: string;
            topicState?: string;
            skip?: number;
            take?: number;
            id?: number[];
            fields?: string[];
        } = {},
    ): Observable<ITopic[]> {
        const requestParams = this.sanitizeRequestParams(params);
        requestParams["topicState"] = params.topicState || "All";
        return this.http.get<ITopic[]>(`${this.apiUrl}/topics`, { params: requestParams }).pipe(
            tap((pulses) =>
                pulses.forEach((pulse) => {
                    this.actualTopicsImageKeyMap[pulse.id] = pulse.icon;
                }),
            ),
            map((pulses) => pulses.map((pulse) => this.syncPendingTopics(pulse))),
        );
    }

    public getById(id: string | number): Observable<ITopic> {
        return this.http
            .get<ITopic>(`${this.apiUrl}/topics/${id}`)
            .pipe(map((topic) => this.syncPendingTopics(topic)));
    }

    public getMyTopics(
        params: { skip?: number; take?: number; state?: TopicState[]; includeStats?: boolean } = {},
    ) {
        return this.http
            .get<ITopic[]>(`${this.apiUrl}/topics/my`, { params })
            .pipe(map((pulses) => pulses.map((pulse) => this.syncPendingTopics(pulse))));
    }

    public create(params: {
        icon: any;
        title: string;
        description: string;
        keywords: string[];
        picture: any;
        category: string;
        location: {
            country: string;
            state?: string;
            city?: string;
        };
    }): Observable<ITopic> {
        const formData = new FormData();

        if (params.location.country) {
            formData.append("Location.Country", params.location.country);
        }
        if (params.location.state) {
            formData.append("Location.State", params.location.state);
        }
        if (params.location.city) {
            formData.append("Location.City", params.location.city);
        }
        if (params.picture) {
            formData.append("Picture", params.picture);
        }
        formData.append("Title", params.title);
        formData.append("Description", params.description);
        formData.append("Category", params.category);
        formData.append("Icon", params.icon);
        params.keywords.forEach((keyword, index) => {
            formData.append(`Keywords[${index}]`, keyword);
        });

        return this.http.post<ITopic>(`${this.apiUrl}/topics/create`, formData);
    }

    public getMapVotes(
        NElatitude: number,
        NElongitude: number,
        SWlatitude: number,
        SWlongitude: number,
        resolution = 1,
        topicId?: number,
    ): Observable<IH3Votes> {
        if (topicId) {
            return this.getMapVotesByTopicId(
                NElatitude,
                NElongitude,
                SWlatitude,
                SWlongitude,
                resolution,
                topicId,
            );
        }

        return this.getMapVotesForLast24Hours(
            NElatitude,
            NElongitude,
            SWlatitude,
            SWlongitude,
            resolution,
        );
    }

    private getMapVotesForLast24Hours(
        NElatitude: number,
        NElongitude: number,
        SWlatitude: number,
        SWlongitude: number,
        resolution = 1,
    ): Observable<IH3Votes> {
        return this.http
            .get<
                { id: string; votes: number; children: any }[]
            >(this.apiUrl + `/map?NE.latitude=${NElatitude}&NE.longitude=${NElongitude}&SW.latitude=${SWlatitude}&SW.longitude=${SWlongitude}&resolution=${resolution}`)
            .pipe(
                map((response) => {
                    const votesPerCells = response.reduce(
                        (acc, h3Cell) => ({
                            ...acc,
                            ...this.getH3CellsFromChildren(h3Cell),
                        }),
                        {},
                    );
                    return votesPerCells;
                }),
            );
    }

    private getMapVotesByTopicId(
        NElatitude: number,
        NElongitude: number,
        SWlatitude: number,
        SWlongitude: number,
        resolution = 1,
        topicId: number,
    ): Observable<IH3Votes> {
        const baseUrl = this.apiUrl + "/map/votes";
        const params = new URLSearchParams({
            "NE.latitude": NElatitude.toString(),
            "NE.longitude": NElongitude.toString(),
            "SW.latitude": SWlatitude.toString(),
            "SW.longitude": SWlongitude.toString(),
            resolution: resolution.toString(),
            topicId: topicId.toString(),
        });
        return this.http.get<IH3Votes>(`${baseUrl}?${params.toString()}`);
    }

    private getH3CellsFromChildren = ({
        id,
        votes,
        children,
        depth = this.currentHeatmapDepth,
    }: {
        id: string;
        votes: number;
        children: any;
        depth?: number;
    }) => {
        depth = +depth;
        if (!children || depth === 1) {
            return {
                [id]: votes,
            };
        }

        return Object.assign(
            { [id]: votes },
            children.reduce(
                (acc: any, child: any) => ({
                    ...acc,
                    ...this.getH3CellsFromChildren({
                        ...child,
                        depth: depth - 1,
                    }),
                }),
                {},
            ),
        );
    };

    public getH3PulsesForMap({
        NElatitude,
        NElongitude,
        SWlatitude,
        SWlongitude,
        resolution = 1,
        category = "",
    }: {
        NElatitude: number;
        NElongitude: number;
        SWlatitude: number;
        SWlongitude: number;
        resolution: number;
        category?: string;
    }): Observable<IH3Pulses> {
        if (resolution >= 8) resolution = 7;
        const searchParams = new URLSearchParams({
            "NE.latitude": NElatitude.toString(),
            "NE.longitude": NElongitude.toString(),
            "SW.latitude": SWlatitude.toString(),
            "SW.longitude": SWlongitude.toString(),
            resolution: resolution.toString(),
        });
        if (category) {
            searchParams.append("category", category);
        }
        return this.http.get<IH3Pulses>(`${this.apiUrl}/map/top?${searchParams.toString()}`).pipe(
            map((response) => {
                if (resolution > 0) return response;
                return Object.entries(response).reduce((prev, [key, value]) => {
                    const h3Index = key.split(":").at(-1);
                    if (h3Index) {
                        prev[h3Index] = value;
                    }
                    return prev;
                }, {} as IH3Pulses);
            }),
        );
    }

    public validateTitle(value: string) {
        return this.http
            .post<IValidateTopicTitleResponse>(`${this.apiUrl}/topics/validate`, { title: value })
            .pipe(
                catchError(() => {
                    return of(false);
                }),
                map((result) => !!result),
            );
    }

    public getCategories(): Observable<ICategory[]> {
        if (!this.categories$) {
            this.categories$ = this.http
                .get<ICategory[]>(`${this.apiUrl}/topics/categories`)
                .pipe(shareReplay({ bufferSize: 1, refCount: true }));
        }
        return this.categories$;
    }

    public getShareKeyFromTitle(title: string): Observable<string> {
        return this.http
            .post<IValidateTopicTitleResponse>(`${this.apiUrl}/topics/validate`, {
                title: title,
            })
            .pipe(
                map((response) => response.shareKey),
                catchError(() => {
                    return of("");
                }),
            );
    }

    public getLeaderboardTopics(
        params: IGetLeaderboardTopicsRequest,
    ): Observable<IGetLeaderboardTopicsResponse> {
        return this.http.get<IGetLeaderboardTopicsResponse>(`${this.apiUrl}/topics/leaderboard`, {
            params: {
                ...params,
            },
        });
    }

    private syncPendingTopics(topic: ITopic): ITopic {
        const pendingTopic = this.pendingTopicsService.get(topic.id);
        if (!pendingTopic) {
            return {
                ...topic,
                stats: topic.stats || {
                    totalVotes: 0,
                    totalUniqueUsers: 0,
                    lastDayVotes: 0,
                },
            };
        }

        const isUpdated =
            !!topic.stats?.totalVotes && topic.stats.totalVotes >= pendingTopic.stats.totalVotes;

        if (isUpdated) {
            this.pendingTopicsService.remove(topic.id);
            return topic;
        } else {
            return {
                ...topic,
                stats: {
                    totalVotes: pendingTopic.stats.totalVotes,
                    totalUniqueUsers: pendingTopic.stats.totalUniqueUsers,
                    lastDayVotes: pendingTopic.stats.lastDayVotes,
                },
            };
        }
    }

    private sanitizeRequestParams(params: RequestParams): RequestParams {
        const sanitized: RequestParams = {};
        for (const key in params) {
            const value = params[key];
            if (Array.isArray(value)) {
                sanitized[key] = value.filter(
                    (value) => value !== undefined && value !== null && value !== "",
                );
            } else if (value !== undefined && value !== null && value !== "") {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }
}
