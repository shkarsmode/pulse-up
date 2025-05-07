import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { expand, last, map, Observable, of, reduce, Subject, takeWhile } from "rxjs";
import { IAuthor, IPulse } from "../../interfaces";
import { API_URL } from "../../tokens/tokens";

@Injectable({
    providedIn: "root",
})
export class UserService {
    private readonly apiUrl: string = inject(API_URL);
    private readonly http: HttpClient = inject(HttpClient);

    public getProfile(id: string): Observable<IAuthor> {
        return this.http.get<IAuthor>(`${this.apiUrl}/users/${id}`);
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
                                isComplete: newData.length === 0,
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
}
