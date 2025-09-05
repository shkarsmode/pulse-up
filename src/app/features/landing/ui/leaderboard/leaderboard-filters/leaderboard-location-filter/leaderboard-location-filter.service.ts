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

const initGlobalOption: ILeaderboardLocationOption = {
    id: "global",
    label: "Global",
    type: "quickPick",
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

    private globalCountriesOptions = new BehaviorSubject<ILeaderboardLocationOption[]>([
        initGlobalOption,
    ]);
    private localCountryOptions = new BehaviorSubject<ILeaderboardLocationOption[]>([]);
    private localStatesOptions = new BehaviorSubject<ILeaderboardLocationOption[]>([]);
    private allOptions$ = combineLatest([
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
                        this.createOption({
                            location: { country, region: null, city: null },
                            type: "global",
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
                                    this.createOption({
                                        location: { country, region: state, city: null },
                                        type: "local",
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
                        this.createOption({
                            location: { country, region: null, city: null },
                            type: "local",
                        }),
                    ]);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    public selectedOption$ = this.leaderboardFiltersService.location$;
    public options$ = combineLatest([this.allOptions$, this.selectedOption$]).pipe(
        map(([[globalOption, userCountry, userStates], selectedOption]) => {
            return [...globalOption, ...userCountry, ...userStates].map(
                (option) =>
                    ({
                        ...option,
                        selected: option.id === selectedOption?.id,
                    }) as ILeaderboardLocationOptionWithSelected,
            );
        }),
    );

    public changeLocation(option: ILeaderboardLocationOption) {
        this.leaderboardFiltersService.changeLocation(option);
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

    private createOption({
        location,
        type,
    }: {
        location: {
            country: string;
            region?: string | null;
            city?: string | null;
        };
        type: "global" | "local";
    }): ILeaderboardLocationOption {
        const { country, region, city } = location;
        const optionId = `${type}-${region ? "state" : "country"}-${region || country}`;
        const label = region ? region : country;
        return {
            id: optionId,
            label,
            type: "quickPick",
            data: {
                country: country,
                region: region || null,
                city: city || null,
            },
        };
    }
}
