import { DestroyRef, inject, Injectable } from "@angular/core";
import {
    BehaviorSubject,
    combineLatest,
    distinctUntilChanged,
    map,
    shareReplay,
    switchMap,
    tap,
} from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ILeaderboardLocationOption } from "@/app/features/landing/interfaces/leaderboard-filter.interface";
import { LeaderboardFiltersService } from "../leaderboard-filters.service";
import { IpLocationService } from "@/app/shared/services/core/ip-location.service";
import { PulseService } from "@/app/shared/services/api/pulse.service";
import { LeaderboardService } from "../../leaderboard.service";
import { DateUtils } from "@/app/features/landing/helpers/date-utils";
import { MapboxFeature } from "@/app/shared/interfaces";
import { createLocationOption } from "@/app/features/landing/helpers/createLocationOption";

const initGlobalOption: ILeaderboardLocationOption = {
    id: "global",
    label: "Global",
    data: {
        country: null,
        region: null,
        city: null,
    },
};

interface ILeaderboardLocationOptionWithSelected extends ILeaderboardLocationOption {
    selected: boolean;
}

@Injectable({
    providedIn: "root",
})
export class LeaderboardLocationFilterService {
    private destroyRef = inject(DestroyRef);
    private pulseService = inject(PulseService);
    private ipLocationService = inject(IpLocationService);
    private leaderboardService = inject(LeaderboardService);
    private leaderboardFiltersService = inject(LeaderboardFiltersService);

    private isSearchMode = new BehaviorSubject<boolean>(false);
    private isSearching = new BehaviorSubject<boolean>(false);
    private searchOptions = new BehaviorSubject<ILeaderboardLocationOption[]>([]);
    private globalCountriesOptions = new BehaviorSubject<ILeaderboardLocationOption[]>([
        initGlobalOption,
    ]);
    private localCountryOptions = new BehaviorSubject<ILeaderboardLocationOption[]>([]);
    private localStatesOptions = new BehaviorSubject<ILeaderboardLocationOption[]>([]);
    private initialOptions$ = combineLatest([
        this.globalCountriesOptions,
        this.localCountryOptions,
        this.localStatesOptions,
    ]);
    private activeFilters$ = this.leaderboardService.filters$.pipe(
        map(({ date, timeframe }) => [date, timeframe] as const),
        distinctUntilChanged((prev, curr) => {
            return prev[0] === curr[0] && prev[1] === curr[1];
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
    );

    constructor() {
        combineLatest([this.ipLocationService.countryName$, this.activeFilters$])
            .pipe(
                switchMap(([userCountry, [date, timeframe]]) => {
                    return this.pulseService
                        .getLeaderboardLocations({
                            date: DateUtils.toISOString(DateUtils.getStatrtOfDay(date)),
                            timeframe: timeframe,
                        })
                        .pipe(
                            map((locations) => locations.map(({ country }) => country)),
                            map((countries) =>
                                countries.filter((globalCountry) => globalCountry !== userCountry),
                            ),
                            map((countries) => Array.from(new Set(countries))),
                            map((countries) => countries.slice(0, 3)),
                        );
                }),
                tap((countries) => {
                    if (!countries.length) {
                        this.globalCountriesOptions.next([initGlobalOption]);
                        return;
                    }
                    const options = countries.map((country) =>
                        createLocationOption({
                            location: { country },
                        }),
                    );
                    this.globalCountriesOptions.next([initGlobalOption, ...options]);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();

        combineLatest([this.ipLocationService.countryName$, this.activeFilters$])
            .pipe(
                switchMap(([country, [date, timeframe]]) => {
                    return this.pulseService
                        .getLeaderboardLocations({
                            date: DateUtils.toISOString(DateUtils.getStatrtOfDay(date)),
                            timeframe: timeframe,
                            "Location.Country": country,
                        })
                        .pipe(
                            map((response) => response.filter((location) => location.state)),
                            map((locations) => locations.slice(0, 3)),
                            tap((locations) => {
                                if (!locations.length) {
                                    this.localStatesOptions.next([]);
                                    return;
                                }
                                const stateOptions = locations.map(({ country, state }) =>
                                    createLocationOption({
                                        location: { country, region: state },
                                    }),
                                );
                                this.localStatesOptions.next(stateOptions);
                            }),
                            map(() => country),
                        );
                }),
                tap((country) => {
                    const isCountryAdded = !!this.localCountryOptions.getValue().length;
                    if (isCountryAdded) return;
                    this.localCountryOptions.next([
                        createLocationOption({
                            location: { country },
                        }),
                    ]);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    public isSearching$ = this.isSearching.asObservable().pipe(distinctUntilChanged());
    public isSearchMode$ = this.isSearchMode.asObservable().pipe(distinctUntilChanged());
    public selectedOption$ = this.leaderboardFiltersService.location$;
    public options$ = combineLatest([
        this.initialOptions$,
        this.searchOptions,
        this.selectedOption$,
        this.isSearchMode,
    ]).pipe(
        map(
            ([
                [globalOption, userCountry, userStates],
                searchOptions,
                selectedOption,
                isSearchMode,
            ]) => {
                if (isSearchMode) return this.markSelectedOption(searchOptions, selectedOption);
                return this.markSelectedOption(
                    [...globalOption, ...userCountry, ...userStates],
                    selectedOption,
                );
            },
        ),
    );
    public isEmpty$ = this.options$.pipe(map((options) => options.length === 0));

    public changeLocation(option: ILeaderboardLocationOption) {
        this.leaderboardFiltersService.changeLocation(option);
    }

    public setSearchMode(isSearch: boolean) {
        this.isSearchMode.next(isSearch);
    }

    public setSearching(isSearching: boolean) {
        this.isSearching.next(isSearching);
    }

    public setSearchOptions(features: MapboxFeature[]) {
        const options = features.reduce((acc, feature) => {
            const location = this.mapFeatureToLocationData(feature);
            if (!location.country) return acc;
            acc.push(
                createLocationOption({
                    location: {
                        country: location.country,
                        region: location.region,
                        city: location.city,
                    },
                }),
            );
            return acc;
        }, [] as ILeaderboardLocationOption[]);
        this.searchOptions.next(options);
    }

    public mapFeatureToLocationData(feature: MapboxFeature): ILeaderboardLocationOption["data"] {
        switch (feature.properties.feature_type) {
            case "country":
                return {
                    country: feature.properties.context.country?.name || null,
                    region: null,
                    city: null,
                };
            case "region":
                return {
                    country: feature.properties.context.country?.name || null,
                    region: feature.properties.context.region?.name || null,
                    city: null,
                };
            case "place":
                return {
                    country: feature.properties.context.country?.name || null,
                    region: feature.properties.context.region?.name || null,
                    city: feature.properties.context.place?.name || null,
                };
            default:
                return {
                    country: null,
                    region: null,
                    city: null,
                };
        }
    }


    private markSelectedOption(
        options: ILeaderboardLocationOption[],
        selectedOption: ILeaderboardLocationOption | null,
    ): ILeaderboardLocationOptionWithSelected[] {
        return options.map((option) => ({
            ...option,
            selected: option.id === selectedOption?.id,
        }));
    }
}
