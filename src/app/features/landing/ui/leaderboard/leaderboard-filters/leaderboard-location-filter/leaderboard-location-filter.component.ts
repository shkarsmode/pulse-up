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
import { LeaderboardLocationOptionSkeletonComponent } from "./leaderboard-location-option-skeleton/leaderboard-location-option-skeleton.component";
import { LeaderboardLocationFilterEmptyPlaceholderComponent } from "./leaderboard-location-filter-empty-placeholder/leaderboard-location-filter-empty-placeholder.component";

@Component({
    selector: "app-leaderboard-location-filter",
    standalone: true,
    imports: [
        AngularSvgIconModule,
        CommonModule,
        MatButtonModule,
        LocationSearchComponent,
        PopoverComponent,
        LeaderboardLocationOptionSkeletonComponent,
        LeaderboardLocationFilterEmptyPlaceholderComponent,
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
    public isSearching$ = this.leaderboardLocationFilterService.isSearching$;
    public isSearchMode$ = this.leaderboardLocationFilterService.isSearchMode$;
    public isEmpty$ = this.leaderboardLocationFilterService.isEmpty$;
    public title$ = this.selectedOption$.pipe(
        map((option) => {
            if (option.id === "global") {
                return "Global";
            }
            const { country, region, city } = option.data;
            return city || region || country;
        }),
    );
    public subtitle$ = this.selectedOption$.pipe(
        map((option) => {
            if (option.id === "global") {
                return "";
            }
            const { country, region, city } = option.data;
            return city ? `${region}, ${country}` : region ? `${country}` : "";
        }),
    );
    public optionIconSrc$ = this.isSearchMode$.pipe(
        map((isSearchMode) =>
            isSearchMode ? "assets/svg/pin.svg" : "assets/svg/trophy.svg",
        ),
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

    public onSelectOption(option: ILeaderboardLocationOption) {
        this.leaderboardLocationFilterService.changeLocation(option);
        this.closeMenu();
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
