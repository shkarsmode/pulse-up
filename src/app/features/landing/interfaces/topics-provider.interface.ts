import { ITopic } from "@/app/shared/interfaces";

export interface TopicsProvider {
    handle(): Promise<ITopic[]>;
    setNext(provider: TopicsProvider): TopicsProvider;
}
