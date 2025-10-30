import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ButtonToggleComponent } from "@/app/shared/components/ui-kit/buttons/button-toggle/button-toggle.component";
import { TopicDailyChartService } from "./topic-daily-chart.service";
import { TopicChartComponent } from "../topic-chart/topic-chart.component";

@Component({
    selector: "app-topic-daily-chart",
    standalone: true,
    imports: [TopicChartComponent, ButtonToggleComponent],
    templateUrl: "./topic-daily-chart.component.html",
    styleUrl: "./topic-daily-chart.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicDailyChartComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private destroyRef = inject(DestroyRef);

    private topicDailyChartService = inject(TopicDailyChartService);

    ngOnInit() {
        this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
            const topicId = Number(params.get("id"));
            this.topicDailyChartService.setTopicId(topicId);
        });
    }

    public isLoading = this.topicDailyChartService.isLoading;
    public data = this.topicDailyChartService.data;
    public labels = this.topicDailyChartService.labels;
    public toggleOptions = [
        { label: "Cumulative", value: "cumulative" },
        { label: "Daily", value: "daily" },
    ];
    public handleToggleChange(value: string) {
        this.topicDailyChartService.setCumulativeMode(value === "cumulative");
    }
}
