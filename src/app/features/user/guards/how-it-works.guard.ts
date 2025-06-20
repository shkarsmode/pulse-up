import { LocalStorageService } from "@/app/shared/services/core/local-storage.service";
import { Injectable } from "@angular/core";
import { CanDeactivate } from "@angular/router";

@Injectable({
    providedIn: "root",
})
export class HowItWorksGuard implements CanDeactivate<unknown> {
    canDeactivate(): boolean {
        const isHowItWorksPageVisited =
            LocalStorageService.get<boolean>("how_it_works_page_visited") || false;
        if (!isHowItWorksPageVisited) {
            LocalStorageService.set("how_it_works_page_visited", true);
        }
        return true;
    }
}
