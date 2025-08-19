import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    EventEmitter,
    inject,
    Output,
    OnInit,
    Input,
    OnChanges,
    SimpleChanges,
} from "@angular/core";
import { SelectComponent } from "@/app/shared/components/material/select/select.component";
import { FormControl } from "@angular/forms";
import { distinctUntilChanged } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { LeaderboardTimeframeExtended } from "@/app/shared/interfaces";
import dayjs from "dayjs";

interface Option {
    value: LeaderboardTimeframeExtended;
    label: string;
}

@Component({
    selector: "app-leaderboard-quick-dates-select",
    standalone: true,
    imports: [SelectComponent],
    templateUrl: "./leaderboard-quick-dates-select.component.html",
    styleUrl: "./leaderboard-quick-dates-select.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardQuickDatesSelectComponent implements OnInit, OnChanges {
    private destroyRef = inject(DestroyRef);

    @Input() timeframe: LeaderboardTimeframeExtended = "last24Hours";

    @Output() changed = new EventEmitter<{
        date: Date;
        timeframe: LeaderboardTimeframeExtended;
    }>();

    public control: FormControl<LeaderboardTimeframeExtended | null>;
    public options: Option[] = [
        { value: "last24Hours", label: "Last 24 Hours" },
        { value: "Week", label: "This Week" },
        { value: "Month", label: "This Month" },
    ];

    public ngOnInit() {
        this.control = new FormControl<LeaderboardTimeframeExtended>(this.timeframe);
        this.control.valueChanges
            .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
            .subscribe((value) => {
                if (value) {
                    this.changed.emit(this.getDateRange(value));
                }
            });
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['timeframe'] && !changes['timeframe'].firstChange) {
            this.control.setValue(this.timeframe);
        }
    }

    private getDateRange(timeframe: LeaderboardTimeframeExtended) {
        switch (timeframe) {
            case "last24Hours":
            case "Day":
                return {
                    date: new Date(),
                    timeframe: "last24Hours" as LeaderboardTimeframeExtended,
                };
            case "Week":
                return {
                    date: dayjs().endOf("week").toDate(),
                    timeframe,
                };
            case "Month":
                return {
                    date: dayjs().endOf("month").toDate(),
                    timeframe,
                };
        }
    }
}
