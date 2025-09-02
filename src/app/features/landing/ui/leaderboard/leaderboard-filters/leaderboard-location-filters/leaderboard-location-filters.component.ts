import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, ViewChild } from "@angular/core";
import { MatMenuModule, MatMenuTrigger } from "@angular/material/menu";
import { AngularSvgIconModule } from "angular-svg-icon";
import { map } from "rxjs";
import { LeaderboardFiltersService } from "../leaderboard-filters.service";
import { ILeaderboardLocationOption } from "@/app/features/landing/interfaces/leaderboard-filter.interface";
import { SpinnerComponent } from "@/app/shared/components/ui-kit/spinner/spinner.component";

@Component({
    selector: "app-leaderboard-location-filters",
    standalone: true,
    imports: [MatMenuModule, MatMenuTrigger, AngularSvgIconModule, CommonModule, SpinnerComponent],
    templateUrl: "./leaderboard-location-filters.component.html",
    styleUrl: "./leaderboard-location-filters.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardLocationFiltersComponent {
    @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

    private leaderboardFiltersService = inject(LeaderboardFiltersService);

    public locationOptions$ = this.leaderboardFiltersService.locationOptions$;
    public selectedLocation$ = this.leaderboardFiltersService.selectedLocation$;
    public buttonText$ = this.selectedLocation$.pipe(
        map((location) => this.getTileFromLocation(location))
    );
    public isRequestingGeolocation$ = this.leaderboardFiltersService.isRequestingGeolocation$;

    public toggleMenu() {
        this.trigger.openMenu();
    }

    public getMoreLocationOptions() {
        this.leaderboardFiltersService.requestMoreLocationOptions();
    }

    public onLocationOptionChange(option: ILeaderboardLocationOption) {
        switch (option.value) {
            case "global":
                this.leaderboardFiltersService.changeLocation({
                    country: null,
                    region: null,
                    city: null,
                });
                break;
            case "country":
                this.leaderboardFiltersService.changeLocation({
                    country: option.label,
                    region: null,
                    city: null,
                });
                break;
            case "region":
                this.leaderboardFiltersService.changeLocation({
                    region: option.label,
                    city: null,
                });
                break;
            case "city":
                this.leaderboardFiltersService.changeLocation({
                    city: option.label,
                });
                break;

            default:
                break;
        }
    }

    private getTileFromLocation(location: ILeaderboardLocationOption): string {
        switch (location.value) {
            case "global":
                return "Global Top 10";
            case "country":
            case "region":
            case "city":
                return `Top 10 in ${location.label}`;
            default:
                return "Global Top 10";
        }
    }
}