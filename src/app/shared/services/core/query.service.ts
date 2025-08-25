import { Injectable } from "@angular/core";
import { injectQuery, QueryObserverOptions } from "@tanstack/angular-query-experimental";
import { QueryFunction, QueryKey } from "@tanstack/query-core";

@Injectable({ providedIn: "root" })
export class QueryService {
    public query<TData, TError = unknown>({
        queryKey,
        queryFn,
        options,
    }: {
        queryKey: QueryKey;
        queryFn: QueryFunction<TData, QueryKey>;
        options?: Partial<QueryObserverOptions<TData, TError>>;
    }) {
        return injectQuery(() => ({
            ...options,
            queryKey,
            queryFn,
        }));
    }
}
