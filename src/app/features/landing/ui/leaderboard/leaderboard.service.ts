import { inject, Injectable } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import {
    BehaviorSubject,
    catchError,
    distinctUntilChanged,
    forkJoin,
    map,
    of,
    shareReplay,
    switchMap,
    tap,
} from "rxjs";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import {
    IGetLeaderboardTopicsResponse,
    LeaderboardTimeframeExtended,
    LeaderboardTimeframeStatus,
} from "@/app/shared/interfaces";
import { getTimeframeStatus } from "../../helpers/getTimeframeStatus";
import {
    ILeaderboardFilter,
    ILeaderboardLocationOption,
    ILeaderboardTempFilter,
} from "../../interfaces/leaderboard-filter.interface";
import { DateUtils } from "../../helpers/date-utils";

const initialTempFilter: ILeaderboardTempFilter = {
    date: null,
    timeframe: "last24Hours",
    location: {
        id: "global",
        label: "Global",
        data: {
            country: null,
            region: null,
            city: null,
        },
    },
};

const initialFilter: ILeaderboardFilter = {
    date: new Date(),
    timeframe: "last24Hours",
};

@Injectable({
    providedIn: "root",
})
export class LeaderboardService {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private pulseService = inject(PulseService);

    private readonly count = 10;
    private tempFilters = new BehaviorSubject<ILeaderboardTempFilter>(initialTempFilter);
    private filters = new BehaviorSubject<ILeaderboardFilter>(initialFilter);
    private timeframeStatus = new BehaviorSubject<LeaderboardTimeframeStatus | null>(null);
    private isLoadingSubject = new BehaviorSubject<boolean>(false);
    private isErrorSubject = new BehaviorSubject<boolean>(false);

    public isLoading$ = this.isLoadingSubject.asObservable();
    public isError$ = this.isErrorSubject.asObservable();
    public filters$ = this.filters.asObservable();
    public tempFilters$ = this.tempFilters.asObservable();
    public timeframeStatus$ = this.timeframeStatus.asObservable();
    public topics$ = this.filters.pipe(
        distinctUntilChanged((prev, curr) => {
            return (
                prev.date.getTime() === curr.date.getTime() &&
                prev.timeframe === curr.timeframe &&
                prev.location?.country === curr.location?.country &&
                prev.location?.region === curr.location?.region &&
                prev.location?.city === curr.location?.city
            );
        }),
        tap(() => {
            this.isLoadingSubject.next(true);
            this.isErrorSubject.next(false);
        }),
        switchMap((filter) => {
            return this.pulseService
                .getLeaderboardTopics({
                    count: this.count,
                    date: DateUtils.toISOString(DateUtils.getStatrtOfDay(filter.date)),
                    timeframe: filter.timeframe,
                    includeTopicDetails: true,
                    ...(filter.location?.country && {
                        "Location.Country": filter.location.country,
                    }),
                    ...(filter.location?.region && { "Location.State": filter.location.region }),
                    ...(filter.location?.city && { "Location.City": filter.location.city }),
                })
                .pipe(
                    catchError(() => {
                        this.isErrorSubject.next(true);
                        this.isLoadingSubject.next(false);
                        return of({
                            date: filter.date.toISOString(),
                            timeframe: filter.timeframe,
                            results: [],
                        } as IGetLeaderboardTopicsResponse);
                    }),
                );
        }),
        map((data) => ({
            ...data,
            results: data.results.map((item) => {
                const isArchived = !item.topic.title || !item.topic.icon;
                return { ...item, topic: { ...item.topic, isArchived } };
            }),
        })),
        switchMap((data) => {
            const archivedTopicsIds = data.results
                .filter((item) => {
                    return item.topic.isArchived;
                })
                .map((item) => item.topic.id);
            if (archivedTopicsIds.length) {
                return forkJoin(archivedTopicsIds.map((id) => this.pulseService.getById(id)))
                    .pipe(
                        map((topics) => {
                            const archivedTopicsMap = new Map(
                                topics.map((topic) => [topic.id, topic]),
                            );
                            return {
                                ...data,
                                results: data.results.map((item) => {
                                    const archivedTopic = archivedTopicsMap.get(item.topic.id);
                                    if (item.topic.isArchived && archivedTopic) {
                                        return { ...item, topic: { ...archivedTopic } };
                                    }
                                    return item;
                                }),
                            };
                        }),
                    )
                    .pipe(
                        catchError(() => {
                            this.isErrorSubject.next(true);
                            this.isLoadingSubject.next(false);
                            return of({
                                date: data.date,
                                timeframe: data.timeframe,
                                results: [],
                            } as IGetLeaderboardTopicsResponse);
                        }),
                    );
            } else {
                return of(data);
            }
        }),
        tap(() => {
            this.isLoadingSubject.next(false);
            this.updateTimeframeStatus();
        }),
        map((data) => data?.results || null),
        shareReplay({ bufferSize: 1, refCount: true }),
    );

    constructor() {
        this.syncFiltersWithQueryParams();
    }

    public setDate(date: Date | null) {
        this.tempFilters.next({
            ...this.tempFilters.getValue(),
            date,
        });
    }

    public setTimeframe(timeframe: LeaderboardTimeframeExtended) {
        this.tempFilters.next({
            ...this.tempFilters.getValue(),
            timeframe,
        });
    }

    public setLocation(location: ILeaderboardLocationOption) {
        const currentFilters = this.tempFilters.getValue();
        this.tempFilters.next({
            ...currentFilters,
            location,
        });
    }

    public applyFilters() {
        this.isErrorSubject.next(false);
        const { date, timeframe, location } = this.tempFilters.getValue();
        this.filters.next({
            date: date || new Date(),
            timeframe,
            location: {
                country: location.data.country,
                region: location.data.region,
                city: location.data.city,
            },
        });
        this.updateQueryParams();
    }

    public updateTimeframeStatus() {
        const { date, timeframe } = this.filters.getValue();
        const status = getTimeframeStatus(date, timeframe);
        this.timeframeStatus.next(status);
    }

    private updateQueryParams() {
        const {
            date,
            timeframe,
            location: {
                id,
                label,
                data: { country, region, city },
            },
        } = this.tempFilters.getValue();
        const queryParams: Record<string, string> = {
            timeframe,
            locationId: id,
            locationName: label,
        };
        if (date) {
            queryParams["date"] = DateUtils.toISOString(DateUtils.getStatrtOfDay(date));
        }
        if (country) {
            queryParams["country"] = country;
        }
        if (region) {
            queryParams["region"] = region;
        }
        if (city) {
            queryParams["city"] = city;
        }
        this.router.navigate([], {
            queryParams,
            queryParamsHandling: "replace",
        });
    }

    private syncFiltersWithQueryParams() {
        const filtersFromurl = this.route.snapshot.queryParamMap;
        const date = filtersFromurl.get("date");
        const timeframe = filtersFromurl.get("timeframe") as LeaderboardTimeframeExtended;
        const country = filtersFromurl.get("country");
        const region = filtersFromurl.get("region");
        const city = filtersFromurl.get("city");
        const locationId = filtersFromurl.get("locationId")!;
        const locationName = filtersFromurl.get("locationName")!;

        const filters: ILeaderboardTempFilter = {
            date: date ? new Date(date) : null,
            timeframe: timeframe || initialTempFilter.timeframe,
            ...(locationId && locationName
                ? {
                      location: {
                          id: locationId,
                          label: locationName,
                          data: {
                              country: country || null,
                              region: region || null,
                              city: city || null,
                          },
                      },
                  }
                : {
                      location: {
                          id: "global",
                          label: "Global",
                          data: { country: null, region: null, city: null },
                      },
                  }),
        };
        this.tempFilters.next(filters);
        this.applyFilters();
    }
}
