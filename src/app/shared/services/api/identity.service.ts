import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError, map, Observable, of } from "rxjs";
import { API_URL } from "../../tokens/tokens";
import { IProfile } from "../../interfaces";

@Injectable({
    providedIn: "root",
})
export class IdentityService {
    private readonly apiUrl: string = inject(API_URL);
    private readonly http: HttpClient = inject(HttpClient);

    private readonly baseUrl: string = `${this.apiUrl}/identity`;

    public checkByPhoneNumber(phoneNumber?: string): Observable<boolean> {
        return this.http
            .post(`${this.baseUrl}/check`, {
                phoneNumber,
            })
            .pipe(
                map((response) => true),
                catchError(() => of(false)),
            );
    }

    public getByToken(token: string): Observable<IProfile | null> {
        return this.http.get<IProfile>(`${this.baseUrl}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }).pipe(
            map((response) => response),
            catchError(() => {
              console.log("Error fetching profile by token");
              return of(null)
            }),
        );
    }

    public createWithToken(token: string): Observable<IProfile | null> {
      return this.http.post<IProfile>(`${this.baseUrl}/create:withToken`, { idToken: token }, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
      })
        .pipe(
            map((response) => response),
            catchError(() => {
              console.log("Error creating profile with token");
              return of(null)
            }),
        );
    }
}
