import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { API_URL } from "../../tokens/tokens";
import { catchError, map, Observable, of } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class IdentityService {
  private readonly apiUrl: string = inject(API_URL);
  private readonly http: HttpClient = inject(HttpClient);

  private readonly baseUrl: string = `${this.apiUrl}/identity`;

  public checkIdentity({ email, phoneNumber }: {
    email?: string,
    phoneNumber?: string,
  }): Observable<boolean> {
    return this.http.post(`${this.baseUrl}/check`, {
      email,
      phoneNumber,
    }).pipe(
      map((response) => true),
      catchError(() => of(false)),
    )
  }
}