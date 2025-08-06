import { inject, Injectable } from "@angular/core";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { BehaviorSubject, scan, switchMap, tap } from "rxjs";
import { AppConstants } from "@/app/shared/constants";
import { ITopic } from "@/app/shared/interfaces";

@Injectable()
export class PulsesPaginationService {
    private pulseService = inject(PulseService);

    private currentPageSubject = new BehaviorSubject(1);
    private loadingSubject = new BehaviorSubject(true);
    private hasMorePages = true;
    private pageData$ = this.currentPageSubject.pipe(
        switchMap((currentPage) => {
            this.loadingSubject.next(true);
            return this.pulseService
                .get({
                    take: AppConstants.PULSES_PER_PAGE,
                    skip: AppConstants.PULSES_PER_PAGE * (currentPage - 1),
                })
                .pipe(
                    tap((topics) => {
                        this.hasMorePages = topics.length === AppConstants.PULSES_PER_PAGE;
                        this.loadingSubject.next(false);
                    }),
                )
        }),
    );

    public topics$ = this.pageData$.pipe(
        scan((acc, newTopics) => [...acc, ...newTopics], [] as ITopic[]),
    );
    
    public loading$ = this.loadingSubject.asObservable();

    public loadMore(): void {
        if (this.hasMorePages) {
            this.currentPageSubject.next(this.currentPageSubject.value + 1);
        }
    }
}
