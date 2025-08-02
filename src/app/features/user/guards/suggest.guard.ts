import { inject, Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";
import { LOCAL_STORAGE_KEYS, LocalStorageService } from "@/app/shared/services/core/local-storage.service";

@Injectable({
    providedIn: "root",
})
export class SuggestGuard implements CanActivate {
    private readonly router: Router = inject(Router);

    private readonly appRoutes = AppRoutes;
    public isUserBeenHere = true;

    canActivate() {
        const isAllowed = this.isAllowed();
        if (!isAllowed) {
            this.router.navigate([this.appRoutes.User.Topic.HOW_IT_WORKS]);
            return false;
        }
        return true;
    }

    private isAllowed(): boolean {
        this.isUserBeenHere = false;
        return LocalStorageService.get<boolean>(LOCAL_STORAGE_KEYS.howItWorksPageVisited) || false;
    }
}
