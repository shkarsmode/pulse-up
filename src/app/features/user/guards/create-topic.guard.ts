import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, RouterStateSnapshot } from "@angular/router";
import { inject, Injectable } from "@angular/core";
import { SendTopicService } from "@/app/shared/services/topic/send-topic.service";

@Injectable({
    providedIn: "root",
})
export class CreateTopicGuard implements CanActivate {
    private sendTopicService = inject(SendTopicService);

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
        this.sendTopicService.isTopicEditing = true;
        return true;
    }
}