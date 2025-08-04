import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, first, tap } from "rxjs";
import { ISettings } from "../../interfaces";
import { API_URL } from "../../tokens/tokens";

@Injectable({
    providedIn: "root",
})
export class SettingsService {
    private readonly apiUrl: string = inject(API_URL);
    private readonly http: HttpClient = inject(HttpClient);

    private loaded = new BehaviorSubject<boolean>(false);
    public loaded$ = this.loaded.asObservable();
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

    public updateSettings(): void {
        this.loaded.next(false);
        this.http
            .get<ISettings>(`${this.apiUrl}/settings`)
            .pipe(
                first(),
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
                    this.loaded.next(true);
                }),
            )
            .subscribe({
                error: (err: unknown) => {
                    console.error("Failed to load settings", err);
                    this.loaded.next(false);
                },
            });
    }
}
