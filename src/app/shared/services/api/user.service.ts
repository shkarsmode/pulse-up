import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, catchError, expand, first, last, map, Observable, of, shareReplay, Subject, switchMap, takeWhile } from "rxjs";
import { IProfile, IPulse, IPaginator } from "../../interfaces";
import { API_URL } from "../../tokens/tokens";
import { IPhoneValidationResult } from "../../interfaces/phone-validatuion-result.interface";

@Injectable({
    providedIn: "root",
})
export class UserService {
    private readonly apiUrl: string = inject(API_URL);
    private readonly http: HttpClient = inject(HttpClient);
    private readonly refreshTrigger$ = new BehaviorSubject<void>(undefined);

    public readonly profile$ = this.refreshTrigger$.pipe(
        switchMap(() =>
            this.http.get<IProfile>(`${this.apiUrl}/users/self`).pipe(
                catchError((error) => {
                    console.error("Failed to fetch own profile:", error);
                    return of(null);
                })
            )
        ),
        shareReplay(1)
    );

    /** Call this after login/logout to refresh profile */
    public refreshProfile() {
        this.refreshTrigger$.next();
    }

    public updateOwnProfile(data: IProfile): Observable<IProfile> {
        const formData = new FormData();
        for (const key in data) {
            const prop = key as keyof typeof data;
            if (data[prop] !== undefined && data[prop] !== null) {
                formData.append(key, data[prop]);
            }
        }
        return this.http.post<IProfile>(`${this.apiUrl}/users/self`, formData);
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
        return this.http.get<IPulse[]>(`${this.apiUrl}/users/${userId}/topics`, {
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
            } as IPaginator<IPulse>)),
        );
    }

    public getAllTopics(userId: string): Observable<IPulse[]> {
        const topics: Subject<IPulse[]> = new Subject();
        const pageSize = 100;

        of({
            pageIndex: 0,
            items: [] as IPulse[],
            isComplete: false,
        })
            .pipe(
                expand(({ items, pageIndex }) =>
                    this.http
                        .get<IPulse[]>(`${this.apiUrl}/users/${userId}/topics`, {
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
            catchError((error) => {
                console.error("Username validation error:", error);
                return of(false); // Return false if there's an error
            }),
            map(() => true),
        );
    }
}
