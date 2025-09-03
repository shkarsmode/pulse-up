import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, combineLatest, map } from "rxjs";
import { ILeaderboardLocationOption } from "@/app/features/landing/interfaces/leaderboard-filter.interface";
import { LeaderboardFiltersService } from "../leaderboard-filters.service";

interface ILeaderboardLocationOptionWithSelected extends ILeaderboardLocationOption {
    selected: boolean;
}

@Injectable({
    providedIn: "root",
})
export class LeaderboardLocationFilterService {
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
