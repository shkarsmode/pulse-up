import { inject, Injectable } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";
import { SettingsService } from "@/app/shared/services/api/settings.service";

@Injectable({
    providedIn: "root",
})
export class LeaderboardShareButtonService {
    private settingsService = inject(SettingsService);
    private shareLeaderboardBaseUrl = toSignal(
        this.settingsService.settings$.pipe(map((settings) => settings.shareLeaderboardBaseUrl)),
        { initialValue: "" },
    );
    public getShareUrl() {
        const params = new URLSearchParams(window.location.search);
        const date = params.get("date");
        const timeframe = params.get("timeframe");
        const locationName = params.get("locationName");
        const newParams = new URLSearchParams();
        if (date) newParams.set("d", date);
        if (timeframe) newParams.set("t", timeframe);
        if (locationName) newParams.set("n", locationName);
        return `${this.shareLeaderboardBaseUrl()}?${newParams.toString()}`;
    }
    public shareUrl = toSignal(
        this.settingsService.settings$.pipe(
            map((settings) => settings.shareLeaderboardBaseUrl),
            map((url) => {
                const params = new URLSearchParams(window.location.search);
                const date = params.get("date");
                const timeframe = params.get("timeframe");
                const locationName = params.get("locationName");
                const newParams = new URLSearchParams();
                if (date) newParams.set("d", date);
                if (timeframe) newParams.set("t", timeframe);
                if (locationName) newParams.set("n", locationName);
                return `${url}?${newParams.toString()}`;
            }),
        ),
        { initialValue: "" },
    );
}
