import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AngularSvgIconModule } from "angular-svg-icon";
import { combineLatest, filter, map } from "rxjs";
import { LeaderboardService } from "./leaderboard.service";
import { SpinnerComponent } from "@/app/shared/components/ui-kit/spinner/spinner.component";
import { LeaderboardListItemComponent } from "./leaderboard-list-item/leaderboard-list-item.component";
import { LeaderboardHintComponent } from "./leaderboard-hint/leaderboard-hint.component";
import { LeaderboardFiltersComponent } from "./leaderboard-filters/leaderboard-filters.component";
import { NoResultsComponent } from "@/app/shared/components/no-results/no-results.component";


@Component({
    selector: "app-leaderboard",
    standalone: true,
    imports: [
    CommonModule,
    SpinnerComponent,
    AngularSvgIconModule,
    LeaderboardListItemComponent,
    LeaderboardHintComponent,
    LeaderboardFiltersComponent,
    NoResultsComponent
],
    templateUrl: "./leaderboard.component.html",
    styleUrl: "./leaderboard.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardComponent {
    private leaderboardService = inject(LeaderboardService);

    private filter$ = this.leaderboardService.filters$;
    private tempFilter$ = this.leaderboardService.tempFilters$;

    public isLoading$ = this.leaderboardService.isLoading$;
    public isError$ = this.leaderboardService.isError$;
    public topics$ = this.leaderboardService.topics$;
    public timeframeStatus$ = this.leaderboardService.timeframeStatus$;
    public date$ = this.filter$.pipe(map((filter) => filter.date));
    public tempDate$ = this.tempFilter$.pipe(map((tempFilter) => tempFilter.date));
    public timeframe$ = this.filter$.pipe(map((filter) => filter.timeframe));
    public hintTimeframe$ = this.timeframe$.pipe(
        filter((timeframe) => timeframe !== "last24Hours"),
    );
    public tempTimeframe$ = this.tempFilter$.pipe(map((tempFilter) => tempFilter.timeframe));

    public isSpinnerVisible$ = combineLatest([this.isLoading$, this.isError$]).pipe(
        map(([isLoading, isError]) => isLoading && !isError),
    );
    public isContentVisible$ = combineLatest([this.isLoading$, this.isError$, this.topics$]).pipe(
        map(
            ([isLoading, isError, topics]) => !isLoading && !isError && topics && topics.length > 0,
        ),
    );
    public isErrorVisible$ = combineLatest([this.isLoading$, this.isError$]).pipe(
        map(([isLoading, isError]) => !isLoading && isError),
    );
    public isEmpty$ = combineLatest([this.topics$, this.isLoading$]).pipe(
        map(([topics, isLoading]) => !isLoading && topics && topics.length === 0),
    );
    
    public isActiveTimeframe$ = this.leaderboardService.timeframeStatus$.pipe(
        map((status) => status === "Active"),
    );

    public updateTimeframeStatus() {
        this.leaderboardService.updateTimeframeStatus();
    }
}
