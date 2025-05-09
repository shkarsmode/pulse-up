import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, tap } from "rxjs";
import { ISettings } from "../../interfaces";
import { API_URL } from "../../tokens/tokens";

@Injectable({
    providedIn: "root",
})
export class SettingsService {
    private readonly apiUrl: string = inject(API_URL);
    private readonly http: HttpClient = inject(HttpClient);

    public apiVersion: string;
    public appStoreUrl: string;
    public blobUrlPrefix: string;
    public defaultAutoPulse: number;
    public deletedCredentialsBlockInterval: number;
    public googlePlayUrl: string;
    public latestAppVersionNumber: number;
    public minVoteInterval: number;
    public shareTopicBaseUrl: string;
    public shareUserBaseUrl: string;

    public getSettings(): Observable<ISettings> {
        return this.http.get<ISettings>(`${this.apiUrl}/settings`).pipe(
            tap((settings) => {
                this.apiVersion = settings.apiVersion;
                this.appStoreUrl = settings.appStoreUrl;
                this.blobUrlPrefix = settings.blobUrlPrefix;
                this.defaultAutoPulse = settings.defaultAutoPulse;
                this.deletedCredentialsBlockInterval = settings.deletedCredentialsBlockInterval;
                this.googlePlayUrl = settings.googlePlayUrl;
                this.latestAppVersionNumber = settings.latestAppVersionNumber;
                this.minVoteInterval = settings.minVoteInterval;
                this.shareTopicBaseUrl = settings.shareTopicBaseUrl;
                this.shareUserBaseUrl = settings.shareUserBaseUrl;
            }),
        );
    }
}
