import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";
import { MatButtonToggleChange, MatButtonToggleModule } from "@angular/material/button-toggle";
import { CommonModule } from "@angular/common";
import { LeaderboardTimeframe, LeaderboardTimeframeExtended } from "@/app/shared/interfaces";

interface RangeItem {
    value: LeaderboardTimeframeExtended;
    label: string;
}

const ranges: Record<LeaderboardTimeframeExtended, RangeItem> = {
    last24Hours: { value: "last24Hours", label: "Last 24 Hours" },
    Day: { value: "Day", label: "Day" },
    Week: { value: "Week", label: "Week" },
    Month: { value: "Month", label: "Month" },
};

@Component({
    selector: "app-calendar-header",
    standalone: true,
    imports: [CommonModule, AngularSvgIconModule, MatButtonToggleModule],
    templateUrl: "./calendar-header.component.html",
    styleUrl: "./calendar-header.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarHeaderComponent {
    @Input() range: LeaderboardTimeframeExtended;
    @Input({
        transform: (value: LeaderboardTimeframeExtended[]) => value.map((range) => ranges[range]),
    })
    ranges: RangeItem[];

    @Output() backClick = new EventEmitter<void>();
    @Output() rangeChange = new EventEmitter<LeaderboardTimeframeExtended>();

    public onBackClick(): void {
        this.backClick.emit();
    }

    public onRangeChange(event: MatButtonToggleChange): void {
        this.rangeChange.emit(event.value as LeaderboardTimeframe);
    }
}
