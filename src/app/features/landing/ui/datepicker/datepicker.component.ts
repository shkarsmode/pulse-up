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
import { CalendarHeaderComponent } from "./calendar-header/calendar-header.component";
import { LeaderboardTimeframe } from "../../interface/leaderboard-timeframe.interface";
import { PrimaryButtonComponent } from "@/app/shared/components/ui-kit/buttons/primary-button/primary-button.component";

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
        const daysToMonday = day === 0 ? -6 : 1 - day;

        const start = this._dateAdapter.addCalendarDays(currentDate, daysToMonday);
        const end = this._dateAdapter.addCalendarDays(start, 6); // 7-day range

        return new DateRange<D>(start, end);
    }
}

@Component({
    selector: "app-datepicker",
    templateUrl: "./datepicker.component.html",
    styleUrls: ["./datepicker.component.scss"],
    standalone: true,
    imports: [CommonModule, MatCalendar, CalendarHeaderComponent, PrimaryButtonComponent],
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
    private viewContainerRef = inject(ViewContainerRef);

    @Input() text: string = "";
    @Input() date: Date | null = null;
    @Input() timeframe: LeaderboardTimeframe = "Day";

    @Output() dateChange = new EventEmitter<Date | null>();
    @Output() timeframeChange = new EventEmitter<LeaderboardTimeframe>();
    @Output() confirm = new EventEmitter<void>();

    @ViewChild("calendarPortal") calendarPortal!: TemplateRef<any>;
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
        return this.timeframe === "Month";
    }
    public get isWeekView(): boolean {
        return this.timeframe === "Week";
    }
    public get isDayView(): boolean {
        return this.timeframe === "Day";
    }
    public get isConfirmAllowed() {
        return !!(
            this.date &&
            ((this.currentView === "month" && this.isDayView) ||
                (this.currentView === "month" && this.isWeekView) ||
                (this.currentView === "year" && this.isMonthView))
        );
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
                    originX: "start",
                    originY: "bottom",
                    overlayX: "start",
                    overlayY: "top",
                },
                {
                    originX: "start",
                    originY: "top",
                    overlayX: "start",
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

        this.overlayRef.backdropClick().subscribe(() => this.overlayRef?.dispose());
    }
    public closeCalendar(): void {
        this.overlayRef?.dispose();
    }

    public onViewChanged(view: MatCalendarView): void {
        console.log("View changed");
        this.currentView = view;
        this.dateChange.emit(null);
        this.selectedDateRange = this.getStartWeekRange();
    }

    public onWeekSelected(date: Date): void {
        if (!date) return;

        const selectedDate = new Date(date);
        const day = selectedDate.getDay(); // 0 (Sun) - 6 (Sat)
        const diff = selectedDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust if Sunday
        const startOfWeek = new Date(selectedDate.setDate(diff));

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        this.selectedDateRange = new DateRange(startOfWeek, endOfWeek);

        this.dateChange.emit(endOfWeek);
    }

    public onDaySelected(date: Date) {
        this.dateChange.emit(date);
    }

    public onMonthSelected(date: Date) {
        this.dateChange.emit(date);
        this.overlayRef?.dispose();
        this.onConfirm();
    }

    public onTimeframeChange(range: LeaderboardTimeframe) {
        this.timeframeChange.emit(range);
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

    public onConfirm() {
        this.confirm.emit();
        this.overlayRef?.dispose();
    }

    private getStartWeekRange(): DateRange<Date> {
        const today = new Date(1970, 0, 7);
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);

        const monday = new Date(today);
        monday.setDate(diff);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        return new DateRange<Date>(monday, sunday);
    }
}
