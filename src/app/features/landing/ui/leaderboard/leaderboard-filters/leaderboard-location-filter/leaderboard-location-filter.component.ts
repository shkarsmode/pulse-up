import { CommonModule } from "@angular/common";
import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    inject,
    ViewChild,
    OnInit,
} from "@angular/core";
import { MatMenuModule, MatMenuTrigger } from "@angular/material/menu";
import { AngularSvgIconModule } from "angular-svg-icon";
import { LeaderboardLocationFilterService } from "./leaderboard-location-filter.service";
import { ILeaderboardLocationOption } from "@/app/features/landing/interfaces/leaderboard-filter.interface";
import { LocationSearchComponent } from "../../leaderboard-location-search/leaderboard-location-search.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { distinctUntilChanged, map, tap } from "rxjs";

@Component({
    selector: "app-leaderboard-location-filter",
    standalone: true,
    imports: [
        MatMenuModule,
        MatMenuTrigger,
        AngularSvgIconModule,
        CommonModule,
        LocationSearchComponent,
    ],
    templateUrl: "./leaderboard-location-filter.component.html",
    styleUrl: "./leaderboard-location-filter.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardLocationFilterComponent implements OnInit {
    @ViewChild("locationMenuTrigger") locationMenuTrigger: MatMenuTrigger;

    private destroyRef = inject(DestroyRef);
    private leaderboardLocationFilterService = inject(LeaderboardLocationFilterService);
    private selectedOption$ = this.leaderboardLocationFilterService.selectedOption$;

    public options$ = this.leaderboardLocationFilterService.options$;
    public buttonText$ = this.selectedOption$.pipe(map((option) => {
        if (option.id === "global") {
            return "Global Top 10";
        } else {
            return `Top 10 in ${option.label}`;
        }
    }));

    ngOnInit() {
        this.selectedOption$
            .pipe(
                distinctUntilChanged((prev, curr) => prev.id === curr.id),
                tap(() => this.onToggleMenu()),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    public onSelect(option: ILeaderboardLocationOption) {
        this.leaderboardLocationFilterService.changeLocation(option);
    }

    public onToggleMenu() {
        console.log("Toggling location filter menu");
        if (this.locationMenuTrigger) {
            this.locationMenuTrigger.toggleMenu();
        }
    }
}
