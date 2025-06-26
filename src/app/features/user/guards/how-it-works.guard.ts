import { LOCAL_STORAGE_KEYS, LocalStorageService } from "@/app/shared/services/core/local-storage.service";
import { Injectable } from "@angular/core";
import { CanDeactivate } from "@angular/router";

@Injectable({
    providedIn: "root",
})
export class HowItWorksGuard implements CanDeactivate<unknown> {
    canDeactivate(): boolean {
        const isHowItWorksPageVisited =
            LocalStorageService.get<boolean>(LOCAL_STORAGE_KEYS.howItWorksPageVisited) || false;
        if (!isHowItWorksPageVisited) {
            LocalStorageService.set(LOCAL_STORAGE_KEYS.howItWorksPageVisited, true);
        }
        return true;
    }
}
