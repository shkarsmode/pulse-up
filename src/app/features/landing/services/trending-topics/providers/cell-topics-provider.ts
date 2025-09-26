import { Injectable } from "@angular/core";
import { firstValueFrom, switchMap } from "rxjs";
import { ITopic } from "@/app/shared/interfaces";
import { BaseTopicsProvider } from "./base-provider";

@Injectable({ providedIn: "root" })
export class CellTopicsProvider extends BaseTopicsProvider {
    public override async handle(): Promise<ITopic[]> {
        const topics = await firstValueFrom(
            this.cellIndex$.pipe(switchMap((h3Index) => this.getCellTopics(h3Index))),
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
