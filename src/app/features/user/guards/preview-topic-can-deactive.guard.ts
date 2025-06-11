import {
    ActivatedRouteSnapshot,
    CanDeactivate,
    GuardResult,
    MaybeAsync,
    RouterStateSnapshot,
} from "@angular/router";
import { inject, Injectable } from "@angular/core";
import { SendTopicService } from "@/app/shared/services/core/send-topic.service";
import { TopicPreviewComponent } from "../topic/topic-preview/topic-preview.component";

@Injectable({
    providedIn: "root",
})
export class PreviewTopicCanDeactiveGuard implements CanDeactivate<TopicPreviewComponent> {
    private sendTopicService = inject(SendTopicService);

    canDeactivate(
        component: TopicPreviewComponent,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState: RouterStateSnapshot,
    ): MaybeAsync<GuardResult> {
        this.sendTopicService.isTopicEditing = false;
        return true;
    }
}
