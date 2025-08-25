import { Injectable } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { asyncScheduler, BehaviorSubject, debounceTime, distinctUntilChanged } from "rxjs";
import { StringUtils } from "@/app/shared/helpers/string-utils";

@Injectable({
    providedIn: "root",
})
export class InputSearchService {
    private readonly inputValueSubject = new BehaviorSubject("");

    public inputValue = toSignal(this.inputValueSubject.asObservable());
    public inputValueChanged$ = this.inputValueSubject.pipe(
        debounceTime(400, asyncScheduler),
        distinctUntilChanged((prev, curr) => {
            return StringUtils.normalizeWhitespace(prev) === StringUtils.normalizeWhitespace(curr);
        }),
    );

    public setValue(value: string): void {
        this.inputValueSubject.next(StringUtils.normalizeWhitespace(value));
    }
}
