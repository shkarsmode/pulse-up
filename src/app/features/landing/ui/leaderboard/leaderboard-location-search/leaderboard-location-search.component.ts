import {
    Component,
    ChangeDetectionStrategy,
    EventEmitter,
    Output,
    inject,
    computed,
    ElementRef,
    ViewChild,
    signal,
    Input,
    OnChanges,
    SimpleChanges,
} from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { AngularSvgIconModule } from "angular-svg-icon";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MapboxFeature } from "@/app/shared/interfaces";
import { LeaderboardLocationSearchService } from "./leaderboard-location-search.service";

@Component({
    selector: "app-location-search",
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        AngularSvgIconModule,
        MatIconModule,
        MatButtonModule,
    ],
    templateUrl: "./leaderboard-location-search.component.html",
    styleUrls: ["./leaderboard-location-search.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationSearchComponent implements OnChanges {
    @Input() shouldFocus: boolean;
    @Output() locationSelected = new EventEmitter<MapboxFeature>();

    @ViewChild("searchInput") searchInput!: ElementRef<HTMLInputElement>;

    private leaderboardLocationSearchService = inject(LeaderboardLocationSearchService);

    private isTyping = signal(false);

    public searchControl = this.leaderboardLocationSearchService.searchControl;
    public suggestions = this.leaderboardLocationSearchService.suggestions;
    public options = this.leaderboardLocationSearchService.options;
    public clearButtonVisible$ = this.leaderboardLocationSearchService.clearButtonVisible$;
    public suggestionsVisible = computed(() => {
        const suggestions = this.suggestions();
        const isTyping = this.isTyping();
        const hasSuggestions = suggestions.length > 0;
        return hasSuggestions && isTyping;
    });

    ngOnChanges(changes: SimpleChanges) {
        if (changes["shouldFocus"] && !changes["shouldFocus"].isFirstChange()) {
            setTimeout(() => {
                this.searchInput?.nativeElement.focus();
            });
        }
    }

    public onFocus() {
        this.isTyping.set(true);
    }

    public onBlur() {
        this.isTyping.set(false);
    }

    public onSuggestionsMouseDown(index: number) {
        const suggestion = this.suggestions()[index];
        this.locationSelected.emit(suggestion);
        this.leaderboardLocationSearchService.clearSuggestions();
    }

    public clearSearch(event: MouseEvent) {
        event.stopPropagation();
        this.isTyping.set(true);
        this.searchControl.setValue("");
        this.searchInput.nativeElement.focus();
    }
}
