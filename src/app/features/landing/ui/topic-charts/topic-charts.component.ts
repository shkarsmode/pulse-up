import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { MatTabsModule } from "@angular/material/tabs";
import { TopicDailyChartComponent } from "../topic-daily-chart/topic-daily-chart.component";
import { TopicHourlyChartComponent } from "../topic-hourly-chart/topic-hourly-chart.component";

@Component({
    selector: "app-topic-chrts",
    standalone: true,
    imports: [MatTabsModule, TopicDailyChartComponent, TopicHourlyChartComponent],
    templateUrl: "./topic-charts.component.html",
    styleUrl: "./topic-charts.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicChrtsComponent {
    public selectedTabIndex = signal(0);

    public onTabChange(index: number): void {
        this.selectedTabIndex.set(index);
    }
}
