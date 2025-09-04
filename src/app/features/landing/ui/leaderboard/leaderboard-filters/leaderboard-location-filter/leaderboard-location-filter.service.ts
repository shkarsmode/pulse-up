import { DestroyRef, inject, Injectable } from "@angular/core";
import { BehaviorSubject, combineLatest, filter, map, take, tap } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ILeaderboardLocationOption } from "@/app/features/landing/interfaces/leaderboard-filter.interface";
import { LeaderboardFiltersService } from "../leaderboard-filters.service";
import { LeaderboardService } from "../../leaderboard.service";
import { IpLocationService } from "@/app/shared/services/core/ip-location.service";

interface ILeaderboardLocationOptionWithSelected extends ILeaderboardLocationOption {
    selected: boolean;
}

@Injectable({
    providedIn: "root",
})
export class LeaderboardLocationFilterService {
    private destroyRef = inject(DestroyRef);
    private leaderboardService = inject(LeaderboardService);
    private ipLocationService = inject(IpLocationService);
    private leaderboardFiltersService = inject(LeaderboardFiltersService);

    private optionsSubject = new BehaviorSubject<ILeaderboardLocationOption[]>([
        {
            id: "global",
            label: "Global",
            type: "quickPick",
            data: {
                country: null,
                region: null,
                city: null,
            },
        },
    ]);

    constructor() {
        this.ipLocationService.countryName$.pipe(
            tap((countryName) => {
                this.optionsSubject.next([
                    ...this.optionsSubject.value,
                    {
                        id: 'user-country',
                        label: countryName,
                        type: "quickPick",
                        data: {
                            country: countryName,
                            region: null,
                            city: null,
                        },
                    }
                ]);
            }),
            takeUntilDestroyed(this.destroyRef),
        ).subscribe()
        // this.leaderboardService.availableLocations$
        //     .pipe(
        //         filter(
        //             (locations) => locations.length > 0 && this.optionsSubject.value.length === 1,
        //         ),
        //         take(1),
        //         map((locations) => locations.slice(0, 3)),
        //         map((locations) =>
        //             locations.map(
        //                 ({ country, state }) =>
        //                     ({
        //                         id: `${country}-${state}`,
        //                         label: `${state}, ${country}`,
        //                         type: "quickPick",
        //                         data: {
        //                             country,
        //                             region: state,
        //                             city: null,
        //                         },
        //                     }) as ILeaderboardLocationOption,
        //             ),
        //         ),
        //         tap((locations) => {
        //             this.optionsSubject.next([this.optionsSubject.value[0], ...locations]);
        //         }),
        //         takeUntilDestroyed(this.destroyRef),
        //     )
        //     .subscribe();
    }

    public selectedOption$ = this.leaderboardFiltersService.location$;
    public options$ = combineLatest([this.optionsSubject, this.selectedOption$]).pipe(
        map(([options, selectedOption]) =>
            options.map(
                (option) =>
                    ({
                        ...option,
                        selected: option.id === selectedOption?.id,
                    }) as ILeaderboardLocationOptionWithSelected,
            ),
        ),
    );

    public changeLocation(option: ILeaderboardLocationOption) {
        this.leaderboardFiltersService.changeLocation(option);
    }
}
