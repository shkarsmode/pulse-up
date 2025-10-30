import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ButtonToggleComponent } from "@/app/shared/components/ui-kit/buttons/button-toggle/button-toggle.component";
import { TopicHourlyChartService } from "./topic-hourly-chart.service";
import { TopicChartComponent } from "../topic-chart/topic-chart.component";
import { TopicChartNoDataComponent } from "../topic-chart-no-data/topic-chart-no-data.component";

@Component({
    selector: "app-topic-hourly-chart",
    standalone: true,
    imports: [TopicChartComponent, ButtonToggleComponent, TopicChartNoDataComponent],
    templateUrl: "./topic-hourly-chart.component.html",
    styleUrl: "./topic-hourly-chart.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicHourlyChartComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private destroyRef = inject(DestroyRef);

    private topicHourlyChartService = inject(TopicHourlyChartService);

    ngOnInit() {
        this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
            const topicId = Number(params.get("id"));
            this.topicHourlyChartService.setTopicId(topicId);
        });
    }

    public isLoading = this.topicHourlyChartService.isLoading;
    public data = this.topicHourlyChartService.data;
    public labels = this.topicHourlyChartService.labels;
    public isEmpty = this.topicHourlyChartService.isEmpty;
    public toggleOptions = [
        { label: "Cumulative", value: "cumulative" },
        { label: "Hourly", value: "hourly" },
    ];
    public handleToggleChange(value: string) {
        this.topicHourlyChartService.setCumulativeMode(value === "cumulative");
    }
}
