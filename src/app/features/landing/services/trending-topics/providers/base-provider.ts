import { ITopic } from "@/app/shared/interfaces";
import { inject } from "@angular/core";
import { firstValueFrom, map } from "rxjs";
import * as H3 from "h3-js";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { IpLocationService } from "@/app/shared/services/core/ip-location.service";
import { TopicsProvider } from "../../../interfaces/topics-provider.interface";

export abstract class BaseTopicsProvider implements TopicsProvider {
    private pulseService = inject(PulseService);
    private ipLocationService = inject(IpLocationService);

    protected nextProvider: TopicsProvider | null = null;
    protected cellIndex$ = this.ipLocationService.countryCoordinates$.pipe(
        map(({ latitude, longitude }) => H3.geoToH3(latitude, longitude, 0)),
    );
    protected cellNeighbors$ = this.cellIndex$.pipe(map((h3Index) => H3.kRing(h3Index, 1)));

    protected getCellTopics(h3Index: string) {
        return this.pulseService.getTopicsByCellIndex(h3Index);
    }

    protected getFullTopics(topicsIds: number[]) {
        return firstValueFrom(
            this.pulseService.get({
                id: [...new Set(topicsIds)],
            }),
        );
    }

    public setNext(provider: TopicsProvider): TopicsProvider {
        this.nextProvider = provider;
        return provider;
    }

    abstract handle(): Promise<ITopic[]>;
}
