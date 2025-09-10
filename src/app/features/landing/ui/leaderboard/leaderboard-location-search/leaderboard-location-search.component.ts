import {
    Component,
    ChangeDetectionStrategy,
    inject,
    ElementRef,
    ViewChild,
    Input,
    OnChanges,
    SimpleChanges,
} from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { AngularSvgIconModule } from "angular-svg-icon";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
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

    @ViewChild("searchInput") searchInput!: ElementRef<HTMLInputElement>;

    private leaderboardLocationSearchService = inject(LeaderboardLocationSearchService);

    public searchControl = this.leaderboardLocationSearchService.searchControl;
    public clearButtonVisible$ = this.leaderboardLocationSearchService.clearButtonVisible$;

    ngOnChanges(changes: SimpleChanges) {
        if (changes["shouldFocus"] && !changes["shouldFocus"].isFirstChange()) {
            setTimeout(() => {
                this.searchInput?.nativeElement.focus();
            });
        }
    }

    public clearSearch(event: MouseEvent) {
        event.stopPropagation();
        this.searchControl.setValue("");
        this.searchInput.nativeElement.focus();
    }
}
