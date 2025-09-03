import { Component, ChangeDetectionStrategy, EventEmitter, Output, inject, signal, computed } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MapboxFeature } from "@/app/shared/interfaces";
import { LeaderboardLocationSearchService } from "./leaderboard-location-search.service";

@Component({
    selector: "app-location-search",
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: "./leaderboard-location-search.component.html",
    styleUrls: ["./leaderboard-location-search.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationSearchComponent {
    @Output() locationSelected = new EventEmitter<MapboxFeature>();

    private leaderboardLocationSearchService = inject(LeaderboardLocationSearchService);
    
    private isTypeMode = signal(false);

    public searchControl = this.leaderboardLocationSearchService.searchControl;
    public suggestions = this.leaderboardLocationSearchService.suggestions;
    public options = this.leaderboardLocationSearchService.options;
    public suggestionsVisible = computed(() => {
        const isTypeMode = this.isTypeMode();
        const hasSuggestions = this.suggestions().length > 0;
        return isTypeMode && hasSuggestions;
    })
    
    public onFocus() {
        this.isTypeMode.set(true);
    }

    public selectSuggestion(event: MouseEvent, index: number) {
        event.stopPropagation();
        const suggestion = this.suggestions()[index];
        this.locationSelected.emit(suggestion);
        this.leaderboardLocationSearchService.setSuggestion(suggestion);
        this.isTypeMode.set(false);
    }
}
