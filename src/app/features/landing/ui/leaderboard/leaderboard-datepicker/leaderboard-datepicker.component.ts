import {
    Component,
    ViewChild,
    ElementRef,
    TemplateRef,
    ViewContainerRef,
    Input,
    Output,
    EventEmitter,
    ChangeDetectionStrategy,
    Injectable,
    inject,
    DestroyRef, 
    OnChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { TemplatePortal } from "@angular/cdk/portal";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { DateAdapter, provideNativeDateAdapter } from "@angular/material/core";
import {
    DateRange,
    MAT_DATE_RANGE_SELECTION_STRATEGY,
    MatCalendar,
    MatCalendarView,
    MatDateRangeSelectionStrategy,
} from "@angular/material/datepicker";
import { AngularSvgIconModule } from "angular-svg-icon";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { LeaderboardTimeframeExtended } from "@/app/shared/interfaces";
import { DateUtils } from "../../../helpers/date-utils";

@Injectable()
export class WeekRangeSelectionStrategy<D = Date> implements MatDateRangeSelectionStrategy<D> {
    private _dateAdapter = inject<DateAdapter<D>>(DateAdapter);

    selectionFinished(date: D | null): DateRange<D> {
        return this._createWeekRange(date);
    }

    createPreview(activeDate: D | null): DateRange<D> {
        return this._createWeekRange(activeDate);
    }

    private _createWeekRange(date: D | null): DateRange<D> {
        const currentDate = date || this._dateAdapter.today();

        const day = this._dateAdapter.getDayOfWeek(currentDate); // 0 (Sunday) to 6 (Saturday)
        const start = this._dateAdapter.addCalendarDays(currentDate, -day); // back to Sunday
        const end = this._dateAdapter.addCalendarDays(start, 6); // through Saturday

        return new DateRange<D>(start, end);
    }
}

@Component({
    selector: "app-leaderboard-datepicker",
    templateUrl: "./leaderboard-datepicker.component.html",
    styleUrls: ["./leaderboard-datepicker.component.scss"],
    standalone: true,
    imports: [CommonModule, MatCalendar, AngularSvgIconModule],
    providers: [
        {
            provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
            useClass: WeekRangeSelectionStrategy,
        },
        provideNativeDateAdapter(),
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardDatepickerComponent implements OnChanges {
    private overlay = inject(Overlay);
    private destroyRef = inject(DestroyRef);
    private viewContainerRef = inject(ViewContainerRef);

    @Input() date: Date | null = null;
    @Input() timeframe: LeaderboardTimeframeExtended;
    @Input() buttonText: string;

    @Output() dateChange = new EventEmitter<Date | null>();

    @ViewChild("calendarPortal") calendarPortal!: TemplateRef<void>;
    @ViewChild("triggerButton") triggerButton!: ElementRef;
    @ViewChild("dayCalendar", { static: false }) dayCalendar!: MatCalendar<Date>;
    @ViewChild("weekCalendar", { static: false }) weekCalendar!: MatCalendar<Date>;
    @ViewChild("monthCalendar", { static: false }) monthCalendar!: MatCalendar<Date>;

    public readonly calendarMinDate = new Date(2025, 5, 1);
    public readonly calendarMaxDate = new Date();
    public overlayRef: OverlayRef | null = null;
    public currentView: MatCalendarView = "month";
    public selectedDateRange: DateRange<Date>;

    public get isMonthView(): boolean {
        return this.timeframe === "Month" || this.timeframe === "last24Hours";
    }
    public get isWeekView(): boolean {
        return this.timeframe === "Week";
    }
    public get isDayView(): boolean {
        return this.timeframe === "Day";
    }

    ngOnChanges(): void {
        this.selectedDateRange = this.getWeekRange(this.date || new Date());
    }

    public openCalendar(): void {
        if (this.overlayRef) {
            this.overlayRef.dispose();
        }

        const positionStrategy = this.overlay
            .position()
            .flexibleConnectedTo(this.triggerButton)
            .withFlexibleDimensions(false)
            .withPush(true)
            .withPositions([
                {
                    originX: "end",
                    originY: "bottom",
                    overlayX: "end",
                    overlayY: "top",
                },
                {
                    originX: "end",
                    originY: "top",
                    overlayX: "end",
                    overlayY: "bottom",
                },
            ]);

        this.overlayRef = this.overlay.create({
            positionStrategy,
            scrollStrategy: this.overlay.scrollStrategies.reposition(),
            hasBackdrop: true,
            backdropClass: "cdk-overlay-transparent-backdrop",
        });

        const portal = new TemplatePortal(this.calendarPortal, this.viewContainerRef);
        this.overlayRef.attach(portal);

        this.overlayRef
            .backdropClick()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.overlayRef?.dispose());
    }
    public openMultiYearView(): void {
        switch (this.timeframe) {
            case "Day":
                this.dayCalendar.currentView = "multi-year";
                break;
            case "Week":
                this.weekCalendar.currentView = "multi-year";
                break;
            case "Month":
                this.monthCalendar.currentView = "multi-year";
                break;
        }
    }

    public closeMultiYearView(): void {
        if (this.dayCalendar) this.dayCalendar.currentView = "month";
        if (this.weekCalendar) this.weekCalendar.currentView = "month";
        if (this.monthCalendar) this.monthCalendar.currentView = "year";
    }

    public onViewChanged(view: MatCalendarView): void {
        if (view !== "multi-year") {
            this.closeMultiYearView();
        }
        this.currentView = view;
        this.dateChange.emit(null);
        this.selectedDateRange = this.getWeekRange(new Date());
    }

    public onWeekSelected(date: Date): void {
        if (!date) return;
        const startOfWeek = DateUtils.getStartOfWeek(date); // Sunday-based week
        const endOfWeek = DateUtils.getEndOfWeek(date);
        this.selectedDateRange = new DateRange(startOfWeek, endOfWeek);
        this.dateChange.emit(startOfWeek);
        this.closeCalendar();
    }

    public onDaySelected(date: Date) {
        this.dateChange.emit(date);
        this.closeCalendar();
    }

    public onMonthSelected(date: Date) {
        this.dateChange.emit(DateUtils.getStartOfMonth(date));
        this.closeCalendar();
    }

    public closeCalendar() {
        this.overlayRef?.dispose();
    }

    private getWeekRange(date: Date): DateRange<Date> {
        return new DateRange<Date>(DateUtils.getStartOfWeek(date), DateUtils.getEndOfWeek(date));
    }
}
