import { LocalStorageService } from "@/app/shared/services/core/local-storage.service";
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, CanDeactivate, GuardResult, MaybeAsync, RouterStateSnapshot } from "@angular/router";

@Injectable({
    providedIn: "root",
})
export class HowItWorksGuard implements CanActivate, CanDeactivate<unknown> {
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
        return true;
    }
    canDeactivate(): boolean {
        const isHowItWorksPageVisited =
            LocalStorageService.get<boolean>("how_it_works_page_visited") || false;
        if (!isHowItWorksPageVisited) {
            LocalStorageService.set("how_it_works_page_visited", true);
        }
        return true;
    }
}
