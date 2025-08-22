import { inject, Injectable } from "@angular/core";
import { PulseService } from "../api/pulse.service";
import { map, of, switchMap } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class SuggestedTopicsService {
    private readonly pulseService = inject(PulseService);

    private _topicId: number | null = null;
    private _category: string | null = null;

    public set topicId(topicId: number) {
        this._topicId = topicId;
    }
    public set category(category: string) {
        this._category = category;
    }

    public suggestedTopics$ = of(null).pipe(
        switchMap(() => {
            if (!this._category || !this._topicId) {
                return of([]);
            }
            return this.pulseService.get({
                category: this._category,
                take: 4,
            });
        }),
        map((topics) => {
          return topics.filter(topic => topic.id !== this._topicId).slice(0, 3);
        })
    );
}
