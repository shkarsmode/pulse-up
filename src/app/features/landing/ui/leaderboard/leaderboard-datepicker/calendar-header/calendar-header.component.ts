import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";
import { MatButtonToggleChange } from "@angular/material/button-toggle";
import { LeaderboardTimeframe, LeaderboardTimeframeExtended } from "@/app/shared/interfaces";


@Component({
    selector: "app-calendar-header",
    standalone: true,
    imports: [AngularSvgIconModule],
    templateUrl: "./calendar-header.component.html",
    styleUrl: "./calendar-header.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarHeaderComponent {
    @Input() range: LeaderboardTimeframeExtended;

    @Output() backClick = new EventEmitter<void>();
    @Output() rangeChange = new EventEmitter<LeaderboardTimeframeExtended>();

    public onBackClick(): void {
        this.backClick.emit();
    }

    public onRangeChange(event: MatButtonToggleChange): void {
        this.rangeChange.emit(event.value as LeaderboardTimeframe);
    }
}
