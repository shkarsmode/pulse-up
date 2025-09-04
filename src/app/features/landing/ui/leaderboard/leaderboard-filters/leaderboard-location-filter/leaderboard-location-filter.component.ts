import { CommonModule } from "@angular/common";
import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    inject,
    OnInit,
    signal,
} from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { distinctUntilChanged, map, tap } from "rxjs";
import { LeaderboardLocationFilterService } from "./leaderboard-location-filter.service";
import { ILeaderboardLocationOption } from "@/app/features/landing/interfaces/leaderboard-filter.interface";
import { LocationSearchComponent } from "../../leaderboard-location-search/leaderboard-location-search.component";
import { PopoverComponent } from "@/app/shared/components/popover/popover.component";
import { MatButtonModule } from "@angular/material/button";
import { MapboxFeature } from "@/app/shared/interfaces";

@Component({
    selector: "app-leaderboard-location-filter",
    standalone: true,
    imports: [
        AngularSvgIconModule,
        CommonModule,
        MatButtonModule,
        LocationSearchComponent,
        PopoverComponent,
    ],
    templateUrl: "./leaderboard-location-filter.component.html",
    styleUrl: "./leaderboard-location-filter.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardLocationFilterComponent implements OnInit {
    private destroyRef = inject(DestroyRef);
    private leaderboardLocationFilterService = inject(LeaderboardLocationFilterService);
    private selectedOption$ = this.leaderboardLocationFilterService.selectedOption$;

    public menuVisible = signal(false);
    public options$ = this.leaderboardLocationFilterService.options$;
    public buttonText$ = this.selectedOption$.pipe(
        map((option) => {
            if (option.id === "global") {
                return "Global Top 10";
            } else {
                return `Top 10 in ${option.label}`;
            }
        }),
    );

    ngOnInit() {
        this.selectedOption$
            .pipe(
                distinctUntilChanged((prev, curr) => prev.id === curr.id),
                tap(() => this.closeMenu()),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    public onSelectOption(option: ILeaderboardLocationOption) {;
        this.leaderboardLocationFilterService.changeLocation(option);
        this.closeMenu();
    }
    public onSelectSuggestion(suggestion: MapboxFeature) {
        this.leaderboardLocationFilterService.changeLocation({
            id: suggestion.id,
            label: suggestion.properties.full_address,
            type: "search",
            data: this.leaderboardLocationFilterService.mapFeatureToLocationData(suggestion),
        });
    }

    public openMenu() {
        this.menuVisible.set(true);
    }

    public closeMenu() {
        this.menuVisible.set(false);
    }

    public onMenuVisibilityChange(visible: boolean) {
        this.menuVisible.set(visible);
    }
}
