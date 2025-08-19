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
import dayjs from "dayjs";
import { CalendarHeaderComponent } from "./calendar-header/calendar-header.component";
import { LeaderboardTimeframeExtended } from "@/app/shared/interfaces";
import { SecondaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/secondary-button/secondary-button.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

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
    selector: "app-datepicker",
    templateUrl: "./datepicker.component.html",
    styleUrls: ["./datepicker.component.scss"],
    standalone: true,
    imports: [
        CommonModule,
        MatCalendar,
        CalendarHeaderComponent,
        AngularSvgIconModule,
        SecondaryButtonComponent,
    ],
    providers: [
        {
            provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
            useClass: WeekRangeSelectionStrategy,
        },
        provideNativeDateAdapter(),
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomDatepickerComponent {
    private overlay = inject(Overlay);
    private destroyRef = inject(DestroyRef);
    private viewContainerRef = inject(ViewContainerRef);

    @Input() text = "";
    @Input() date: Date | null = null;
    @Input() selectedTimeframe: LeaderboardTimeframeExtended;
    @Input() timeframes: LeaderboardTimeframeExtended[];

    @Output() dateChange = new EventEmitter<Date | null>();
    @Output() timeframeChange = new EventEmitter<LeaderboardTimeframeExtended>();
    @Output() confirm = new EventEmitter<void>();

    @ViewChild("calendarPortal") calendarPortal!: TemplateRef<void>;
    @ViewChild("triggerButton") triggerButton!: ElementRef;
    @ViewChild("dayCalendar", { static: false }) dayCalendar!: MatCalendar<Date>;
    @ViewChild("weekCalendar", { static: false }) weekCalendar!: MatCalendar<Date>;
    @ViewChild("monthCalendar", { static: false }) monthCalendar!: MatCalendar<Date>;

    public readonly calendarMinDate = new Date(2025, 5, 1);
    public readonly calendarMaxDate = new Date();
    public overlayRef: OverlayRef | null = null;
    public currentView: MatCalendarView = "month";
    public selectedDateRange: DateRange<Date> = this.getStartWeekRange();

    public get isMonthView(): boolean {
        return this.selectedTimeframe === "Month" || this.selectedTimeframe === "last24Hours";
    }
    public get isWeekView(): boolean {
        return this.selectedTimeframe === "Week";
    }
    public get isDayView(): boolean {
        return this.selectedTimeframe === "Day";
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
        switch (this.selectedTimeframe) {
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
        this.selectedDateRange = this.getStartWeekRange();
    }

    public onWeekSelected(date: Date): void {
        if (!date) return;
        const selected = dayjs(date);
        const startOfWeek = selected.startOf("week"); // Sunday-based week
        const endOfWeek = selected.endOf("week");
        this.selectedDateRange = new DateRange(startOfWeek.toDate(), endOfWeek.toDate());
        this.dateChange.emit(endOfWeek.toDate());
        this.confirmAndClose();
    }

    public onDaySelected(date: Date) {
        this.dateChange.emit(date);
        this.confirmAndClose();
    }

    public onMonthSelected(date: Date) {
        this.dateChange.emit(dayjs(date).endOf("month").toDate());
        this.timeframeChange.emit("Month");
        this.confirmAndClose();
    }

    public onTimeframeChange(range: LeaderboardTimeframeExtended) {
        this.timeframeChange.emit(range);

        if (range === "last24Hours") {
            this.dateChange.emit(new Date());
            return this.confirmAndClose();
        }

        this.dateChange.emit(null);

        this.selectedDateRange = this.getStartWeekRange();
        setTimeout(() => {
            switch (range) {
                case "Day":
                    this.dayCalendar.currentView = "month";
                    break;
                case "Week":
                    this.weekCalendar.currentView = "month";
                    break;
                case "Month":
                    this.monthCalendar.currentView = "year";
                    break;
            }
        }, 0);
    }

    public confirmAndClose() {
        this.confirm.emit();
        this.overlayRef?.dispose();
    }

    private getStartWeekRange(): DateRange<Date> {
        const today = new Date(1970, 0, 7); // Example date: Wednesday, Jan 7, 1970
        const day = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

        const sunday = new Date(today);
        sunday.setDate(today.getDate() - day); // Go back to Sunday

        const saturday = new Date(sunday);
        saturday.setDate(sunday.getDate() + 6); // Add 6 days for full week

        return new DateRange<Date>(sunday, saturday);
    }
}
