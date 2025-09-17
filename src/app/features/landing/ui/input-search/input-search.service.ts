import { inject, Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { asyncScheduler, BehaviorSubject, debounceTime, distinctUntilChanged } from "rxjs";
import { StringUtils } from "@/app/shared/helpers/string-utils";

@Injectable({
    providedIn: "root",
})
export class InputSearchService {
    private route = inject(ActivatedRoute);
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

    public syncValueWithQueryParams(): void {
        const params = this.route.snapshot.queryParamMap;
        const search = params.get("search");
        if (search !== null && search.length) {
            this.setValue(search);
        }
    }
}
