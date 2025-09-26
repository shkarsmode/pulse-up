import { inject, Injectable } from "@angular/core";
import { firstValueFrom, map } from "rxjs";
import { BaseTopicsProvider } from "./base-provider";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { ITopic } from "@/app/shared/interfaces";

@Injectable({ providedIn: "root" })
export class LeaderboardTopicsProvider extends BaseTopicsProvider {
    private service = inject(PulseService);
    public override async handle(): Promise<ITopic[]> {
        const topics = await firstValueFrom(
            this.service
                .getLeaderboardTopics({
                    timeframe: "last24Hours",
                    count: 20,
                    includeTopicDetails: true,
                })
                .pipe(map((response) => response.results.map((item) => item.topic))),
        );

        if (topics.length < 10) {
            if (this.nextProvider) {
                return this.nextProvider.handle();
            } else {
                return [];
            }
        }
        return this.getFullTopics(topics.map(({ id }) => id));
    }
}
