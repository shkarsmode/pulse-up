import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";
import { MatButtonToggleChange, MatButtonToggleModule } from "@angular/material/button-toggle";
import { CommonModule } from "@angular/common";
import { LeaderboardTimeframe } from "../../../interface/leaderboard-timeframe.interface";

interface RangeItem {
    value: LeaderboardTimeframe;
    label: string;
}

const ranges: RangeItem[] = [
    { value: "Day", label: "Day" },
    { value: "Week", label: "Week" },
    { value: "Month", label: "Month" },
];

@Component({
    selector: "app-calendar-header",
    standalone: true,
    imports: [CommonModule, AngularSvgIconModule, MatButtonToggleModule],
    templateUrl: "./calendar-header.component.html",
    styleUrl: "./calendar-header.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarHeaderComponent {
    @Input({ required: true }) range: LeaderboardTimeframe;

    @Output() backClick = new EventEmitter<void>();
    @Output() rangeChange = new EventEmitter<LeaderboardTimeframe>();

    public ranges = ranges;

    public onBackClick(): void {
        this.backClick.emit();
    }
    
    public onRangeChange(event: MatButtonToggleChange): void {
        this.rangeChange.emit(event.value as LeaderboardTimeframe);
    }
}
