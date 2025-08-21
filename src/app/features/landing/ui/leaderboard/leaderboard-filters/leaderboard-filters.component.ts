import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl } from "@angular/forms";
import { AngularSvgIconModule } from "angular-svg-icon";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { distinctUntilChanged, filter, map, tap } from "rxjs";
import { SelectComponent } from "@/app/shared/components/material/select/select.component";
import { LeaderboardTimeframeExtended } from "@/app/shared/interfaces";
import { LeaderboardFiltersService } from "./leaderboard-filters.service";
import { LeaderboardDatepickerComponent } from "../leaderboard-datepicker/leaderboard-datepicker.component";

@Component({
    selector: "app-leaderboard-filters",
    standalone: true,
    imports: [CommonModule, SelectComponent, AngularSvgIconModule, LeaderboardDatepickerComponent],
    templateUrl: "./leaderboard-filters.component.html",
    styleUrl: "./leaderboard-filters.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardFiltersComponent implements OnInit, OnDestroy {
    private destroyRef = inject(DestroyRef);
    private leaderboardFiltersService = inject(LeaderboardFiltersService);

    private timeframeControlInitialized = false;
    public timeframeOptions = this.leaderboardFiltersService.timeframeOptions;
    public timeframeControl = new FormControl<LeaderboardTimeframeExtended>("last24Hours");
    public date$ = this.leaderboardFiltersService.date$;
    public timeframe$ = this.leaderboardFiltersService.timeframe$;
    public buttonText$ = this.leaderboardFiltersService.dateFormatted$;
    public datepickerButtonVisible$ = this.leaderboardFiltersService.timeframe$.pipe(
        map((timeframe) => timeframe !== "last24Hours"),
    );

    public ngOnInit() {
        this.leaderboardFiltersService.timeframe$
            .pipe(
                tap((timeframe) => this.initializeTimeframeConstrol(timeframe)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();

        this.timeframeControl.valueChanges
            .pipe(
                distinctUntilChanged(),
                filter((value) => !!value),
                tap((timeframe) => this.leaderboardFiltersService.changeTimeframe(timeframe)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    public ngOnDestroy() {
        this.leaderboardFiltersService.resetFilters();
    }

    public onDateChange(date: Date | null) {
        this.leaderboardFiltersService.changeDate(date);
    }

    private initializeTimeframeConstrol(timeframe: LeaderboardTimeframeExtended) {
        if (this.timeframeControlInitialized) return;
        this.timeframeControlInitialized = true;
        this.timeframeControl.setValue(timeframe);
    }
}
