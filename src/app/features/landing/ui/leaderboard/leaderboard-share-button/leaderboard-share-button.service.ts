import { inject, Injectable } from "@angular/core";
import { SettingsService } from "@/app/shared/services/api/settings.service";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class LeaderboardShareButtonService {
    private settingsService = inject(SettingsService);
    public shareUrl = toSignal(
        this.settingsService.settings$.pipe(
            map((settings) => settings.shareTopicBaseUrl),
            map((url) => url.replace("/t/", "/l/")),
            map((url) => url + window.location.search),
        ),
        { initialValue: "" },
    );
}
