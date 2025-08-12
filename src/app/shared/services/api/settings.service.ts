import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { shareReplay } from "rxjs";
import { ISettings } from "../../interfaces";
import { API_URL } from "../../tokens/tokens";

@Injectable({
    providedIn: "root",
})
export class SettingsService {
    private readonly apiUrl: string = inject(API_URL);
    private readonly http: HttpClient = inject(HttpClient);

    public settings$ = this.http
        .get<ISettings>(`${this.apiUrl}/settings`)
        .pipe(shareReplay({ bufferSize: 1, refCount: true }));
}
