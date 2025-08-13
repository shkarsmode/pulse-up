import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { shareReplay, startWith } from "rxjs";
import { ISettings } from "../../interfaces";
import { API_URL } from "../../tokens/tokens";

@Injectable({
    providedIn: "root",
})
export class SettingsService {
    private readonly apiUrl: string = inject(API_URL);
    private readonly http: HttpClient = inject(HttpClient);

    private readonly defaultSettings: ISettings = {
        apiVersion: "2506.1",
        appStoreUrl: "https://apps.apple.com/us/app/pulse-up-what-matters-today/id6744602366",
        blobUrlPrefix: "https://pulsedevdata.blob.core.windows.net",
        defaultActiveTopicsLimit: 10,
        defaultAutoPulse: 7,
        deletedCredentialsBlockInterval: 1,
        googlePlayUrl: "https://play.google.com/store/apps/details?id=com.pulseup",
        latestAppVersionNumber: 1,
        leaderboardSize: 50,
        minVoteInterval: 1440,
        shareTopicBaseUrl:
            "https://app-pulselinks-dev-drcjbxbjbgbabjhv.eastus2-01.azurewebsites.net/t/",
        shareUserBaseUrl:
            "https://app-pulselinks-dev-drcjbxbjbgbabjhv.eastus2-01.azurewebsites.net/u/",
    };

    public settings$ = this.http.get<ISettings>(`${this.apiUrl}/settings`).pipe(
        startWith(this.defaultSettings),
        shareReplay({ bufferSize: 1, refCount: true }),
    );
}
