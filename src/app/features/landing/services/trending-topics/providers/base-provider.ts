import { ITopic } from "@/app/shared/interfaces";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { IpLocationService } from "@/app/shared/services/core/ip-location.service";
import { inject } from "@angular/core";
import { filter, firstValueFrom, from, map, switchMap } from "rxjs";
import { TopicsProvider } from "../../../interfaces/topics-provider.interface";
import { H3Service } from '../../h3.service';

export abstract class BaseTopicsProvider implements TopicsProvider {
    private readonly pulseService = inject(PulseService);
    private readonly ipLocationService = inject(IpLocationService);
    private readonly h3Service = inject(H3Service);

    protected nextProvider: TopicsProvider | null = null;

    protected cellIndex$ = this.ipLocationService.countryCoordinates$.pipe(
        switchMap(({ latitude, longitude }) =>
            from(this.h3Service.geoToH3Index(latitude, longitude, 0))
        ),
        filter((h3Index): h3Index is string => !!h3Index)
    );

    protected cellNeighbors$ = this.cellIndex$.pipe(
        map((h3Index) => [h3Index])
    );

    protected getCellTopics(h3Index: string) {
        return this.pulseService.getTopicsByCellIndex(h3Index);
    }

    protected getFullTopics(topicsIds: number[]) {
        return firstValueFrom(
            this.pulseService.get({
                id: [...new Set(topicsIds)]
            })
        );
    }

    public setNext(provider: TopicsProvider): TopicsProvider {
        this.nextProvider = provider;
        return provider;
    }

    abstract handle(): Promise<ITopic[]>;
}
