import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, OnInit } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";
import { MatButtonToggleChange, MatButtonToggleModule } from "@angular/material/button-toggle";
import { CommonModule } from "@angular/common";
import { LeaderboardTimeframe, LeaderboardTimeframeExtended } from "@/app/shared/interfaces";

interface RangeItem {
    value: LeaderboardTimeframeExtended;
    label: string;
}

const ranges: RangeItem[] = [
    { value: "last24Hours", label: "Last 24 Hours" },
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
export class CalendarHeaderComponent implements OnInit {
    @Input() range: LeaderboardTimeframeExtended;

    @Output() backClick = new EventEmitter<void>();
    @Output() rangeChange = new EventEmitter<LeaderboardTimeframeExtended>();

    public ranges: RangeItem[];

    ngOnInit(): void {
        this.ranges =
        this.range === "last24Hours"
            ? ranges.filter((range) => range.value !== "last24Hours")
            : ranges;
    }

    public onBackClick(): void {
        this.backClick.emit();
    }

    public onRangeChange(event: MatButtonToggleChange): void {
        this.rangeChange.emit(event.value as LeaderboardTimeframe);
    }
}
