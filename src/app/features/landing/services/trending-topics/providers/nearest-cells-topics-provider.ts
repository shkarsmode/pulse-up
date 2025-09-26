import { ITopic } from "@/app/shared/interfaces";
import { Injectable } from "@angular/core";
import { BaseTopicsProvider } from "./base-provider";
import { firstValueFrom, forkJoin, map, switchMap } from "rxjs";

@Injectable({ providedIn: "root" })
export class NearestCellsTopicsProvider extends BaseTopicsProvider {
    public override async handle(): Promise<ITopic[]> {
        const topics = await firstValueFrom(
            this.cellNeighbors$.pipe(
                switchMap((h3Indexes) => {
                    return forkJoin(h3Indexes.map((h3Index) => this.getCellTopics(h3Index)));
                }),
                map((topics) => topics.flat()),
            ),
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
