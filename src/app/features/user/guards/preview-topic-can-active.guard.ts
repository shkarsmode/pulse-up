import {
    ActivatedRouteSnapshot,
    CanActivate,
    GuardResult,
    MaybeAsync,
    Router,
    RouterStateSnapshot,
} from "@angular/router";
import { inject, Injectable } from "@angular/core";
import { SendTopicService } from "@/app/shared/services/core/send-topic.service";
import { AppRoutes } from "@/app/shared/enums/app-routes.enum";

@Injectable({
    providedIn: "root",
})
export class PreviewTopicCanActiveGuard implements CanActivate {
    private router = inject(Router);
    private sendTopicService = inject(SendTopicService);

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ): MaybeAsync<GuardResult> {
        const isAllowed = this.sendTopicService.isTopicEditing;
        if (!isAllowed) {
            this.router.navigateByUrl(AppRoutes.Landing.TOPICS);
            return false;
        }
        return true;
    }
}
