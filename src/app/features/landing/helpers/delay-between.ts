import { delay, mergeMap, Observable, of } from "rxjs";

export function delayBetween<T>(delayMs: number, first = false) {
    let past = Date.now();

    return (source: Observable<T>) =>
        source.pipe(
            mergeMap((value, index) => {
                const now = Date.now();
                const delayFor = Math.max(index === 0 && !first ? 0 : past + delayMs - now, 0);
                past = now + delayFor;

                return of(value).pipe(delay(delayFor));
            }),
        );
}
