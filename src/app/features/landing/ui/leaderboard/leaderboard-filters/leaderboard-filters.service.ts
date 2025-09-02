import { DestroyRef, inject, Injectable, signal } from "@angular/core";
import {
    catchError,
    combineLatest,
    distinctUntilChanged,
    from,
    map,
    Observable,
    of,
    switchMap,
    tap,
} from "rxjs";
import { LeaderboardTimeframeExtended, MapboxFeatureCollection } from "@/app/shared/interfaces";
import { LeaderboardService } from "../leaderboard.service";
import { DateUtils } from "../../../helpers/date-utils";
import { IpLocationService } from "@/app/shared/services/core/ip-location.service";
import { MapboxPlacesService } from "@/app/shared/services/api/mapbox-places.service";
import { GeolocationCacheService } from "@/app/shared/services/core/geolocation-cache.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ILeaderboardFilterLocation, ILeaderboardLocationOption } from "../../../interfaces/leaderboard-filter.interface";

interface Option {
    value: LeaderboardTimeframeExtended;
    label: string;
}

const initialLocationOptions: ILeaderboardLocationOption[] = [{ label: "Global", value: "global" }];

const TIMEFRAME_OPTIONS: Option[] = [
    { value: "last24Hours", label: "Last 24 Hours" },
    { value: "Day", label: "Daily" },
    { value: "Week", label: "Weekly" },
    { value: "Month", label: "Monthly" },
];

@Injectable({
    providedIn: "root",
})
export class LeaderboardFiltersService {
    private destroyRef = inject(DestroyRef);
    private leaderboardService = inject(LeaderboardService);
    private ipLocationService = inject(IpLocationService);
    private mapboxPlacesService = inject(MapboxPlacesService);
    private geolocationCacheService = inject(GeolocationCacheService);

    private _locationOptions = signal<ILeaderboardLocationOption[]>(initialLocationOptions);

    public timeframeOptions: Option[] = TIMEFRAME_OPTIONS;
    public date$ = this.leaderboardService.tempFilters$.pipe(
        map((filters) => filters.date),
        distinctUntilChanged(),
    );
    public timeframe$ = this.leaderboardService.tempFilters$.pipe(
        map((filters) => filters.timeframe),
        distinctUntilChanged(),
    );
    public selectedLocation$ = this.leaderboardService.tempFilters$.pipe(
        map((filters) => {
            const { country, region, city } = filters.location;
            if (city) {
                return { label: city, value: "city" } as ILeaderboardLocationOption;
            } else if (region) {
                return { label: region, value: "region" } as ILeaderboardLocationOption;
            } else if (country) {
                return { label: country, value: "country" } as ILeaderboardLocationOption;
            } else {
                return { label: "Global", value: "global" } as ILeaderboardLocationOption;
            }
        }),
        distinctUntilChanged((a, b) => a.value === b.value && a.label === b.label),
    );
    public dateFormatted$ = combineLatest([this.date$, this.timeframe$]).pipe(
        map(([date, timeframe]) => {
            switch (timeframe) {
                case "last24Hours":
                    return "";
                case "Day":
                    return date ? DateUtils.format(date, "MMM DD") : "";
                case "Week":
                    return date
                        ? `${DateUtils.format(DateUtils.getStartOfWeek(date), "MMM DD")} - ${DateUtils.format(DateUtils.getEndOfWeek(date), "MMM DD")}`
                        : "";
                case "Month":
                    return date ? DateUtils.format(date, "MMM YYYY") : "";
                default:
                    return "";
            }
        }),
    );
    public locationOptions = this._locationOptions.asReadonly();

    constructor() {
        this.initializeLocationOptions();
    }

    public changeDate(date: Date | null) {
        this.leaderboardService.setDate(date);
        this.leaderboardService.applyFilters();
    }

    public changeTimeframe(timeframe: LeaderboardTimeframeExtended) {
        const today = new Date();
        switch (timeframe) {
            case "last24Hours":
                this.leaderboardService.setDate(today);
                break;
            case "Day":
                this.leaderboardService.setDate(today);
                break;
            case "Week":
                this.leaderboardService.setDate(DateUtils.getStartOfWeek(new Date()));
                break;
            case "Month":
                this.leaderboardService.setDate(DateUtils.getStartOfMonth(new Date()));
                break;
        }
        this.leaderboardService.setTimeframe(timeframe);
        this.leaderboardService.applyFilters();
    }

    public changeLocation(location: Partial<ILeaderboardFilterLocation>) {
        this.leaderboardService.setLocation(location);
        this.leaderboardService.applyFilters();
    }

    public resetFilters() {
        this.leaderboardService.setDate(new Date());
        this.leaderboardService.setTimeframe("last24Hours");
        this.leaderboardService.applyFilters();
    }

    private initializeLocationOptions() {
        const geolocation = this.geolocationCacheService.get();

        const coordinates$ = geolocation
            ? of({
                  longitude: geolocation.geolocationPosition.coords.longitude,
                  latitude: geolocation.geolocationPosition.coords.latitude,
              })
            : this.ipLocationService.coordinates$;

        coordinates$
            .pipe(
                switchMap((coords) => this.getFeaturesFromCoordinates(coords)),
                tap((features) => {
                    if (!features) return;

                    const options: ILeaderboardLocationOption[] = [...initialLocationOptions];
                    const countryName = this.getCountryName(features);
                    const regionName = this.getRegionName(features);

                    if (countryName) {
                        options.push({ label: countryName, value: "country" });
                    }
                    if (geolocation && regionName) {
                        options.push({ label: regionName, value: "region" });
                    }
                    this._locationOptions.set(options);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    private getFeaturesFromCoordinates(coordinates: {
        longitude: number;
        latitude: number;
    }): Observable<MapboxFeatureCollection | null> {
        return from(this.mapboxPlacesService.reverse(coordinates)).pipe(catchError(() => of(null)));
    }

    private getCountryName(data: MapboxFeatureCollection) {
        const feature = data.features.find((feature) =>
            feature?.place_type?.find((type) => type === "country"),
        );
        return feature?.place_name || null;
    }

    private getRegionName(data: MapboxFeatureCollection) {
        const feature = data.features.find((feature) =>
            feature?.place_type?.find((type) => type === "region"),
        );
        return feature?.place_name || null;
    }
}
