import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, catchError, expand, last, map, Observable, of, shareReplay, Subject, switchMap, takeWhile } from "rxjs";
import { IProfile, ITopic, IPaginator } from "../../interfaces";
import { API_URL } from "../../tokens/tokens";
import { IPhoneValidationResult } from "../../interfaces/phone-validatuion-result.interface";
import { Nullable } from "../../types";

@Injectable({
    providedIn: "root",
})
export class UserService {
    private readonly apiUrl: string = inject(API_URL);
    private readonly http: HttpClient = inject(HttpClient);

    public updateOwnProfile(data: IProfile): Observable<IProfile> {
        const formData = new FormData();
        for (const key in data) {
            const prop = key as keyof typeof data;
            formData.append(key, data[prop] || "");
        }
        return this.http.post<IProfile>(`${this.apiUrl}/users/self`, formData);
    }

    public getOwnProfile(): Observable<Nullable<IProfile>> {
        return this.http.get<IProfile>(`${this.apiUrl}/users/self`).pipe(
            catchError(() => {
                return of(null);
            })  
        );
    }

    public getProfileById(id: string): Observable<IProfile> {
        return this.http.get<IProfile>(`${this.apiUrl}/users/${id}`);
    }

    public getProfileByUsername(username: string): Observable<IProfile> {
        return this.http.get<IProfile>(`${this.apiUrl}/users/find`, { params: { username } });
    }

    public getTopics({
        userId,
        page,
        itemsPerPage,
        includeStats,
    }: {
        userId: string;
        page: number;
        itemsPerPage: number;
        includeStats?: boolean;
    }) {
        return this.http.get<ITopic[]>(`${this.apiUrl}/users/${userId}/topics`, {
            params: {
                skip: itemsPerPage * (page - 1),
                take: itemsPerPage,
                includeStats: !!includeStats,
            },
        }).pipe(
            map((response) => ({
                items: response,
                page: page,
                hasMorePages: response.length !== 0 && response.length === itemsPerPage,
            } as IPaginator<ITopic>)),
        );
    }

    public getAllTopics(userId: string): Observable<ITopic[]> {
        const topics: Subject<ITopic[]> = new Subject();
        const pageSize = 100;

        of({
            pageIndex: 0,
            items: [] as ITopic[],
            isComplete: false,
        })
            .pipe(
                expand(({ items, pageIndex }) =>
                    this.http
                        .get<ITopic[]>(`${this.apiUrl}/users/${userId}/topics`, {
                            params: {
                                skip: pageIndex * pageSize,
                                take: pageSize,
                                includeStats: true,
                            },
                        })
                        .pipe(
                            map((newData) => ({
                                items: [...items, ...newData],
                                pageIndex: pageIndex + 1,
                                isComplete: newData.length < pageSize,
                            })),
                        ),
                ),
                takeWhile(({ isComplete }) => !isComplete, true),
                last(),
                map(({ items }) => items),
            )
            .subscribe((data) => {
                topics.next(data);
                topics.complete();
            });

        return topics;
    }

    public validatePhoneNumber(phoneNumber: string): Observable<IPhoneValidationResult> {
        return this.http.post<IPhoneValidationResult>(`${this.apiUrl}/users/validate:phone`, { phoneNumber }).pipe(
            map((response) => {
                if (response) {
                    return response;
                } else {
                    throw new Error("Phone number validation failed", response);
                }
            }),
        );
    }

    public validateUsername = (username: string): Observable<boolean> => {
        return this.http.post<{ username: string }>(`${this.apiUrl}/users/validate`, { username }).pipe(
            catchError(() => {
                return of(false);
            }),
            map((result) => !!result),
        );
    }
}
