import { TopicService } from "@/app/features/landing/pages/topic/topic.service";
import { ButtonToggleComponent } from "@/app/shared/components/ui-kit/buttons/button-toggle/button-toggle.component";
import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { TopicChartNoDataComponent } from "../topic-chart-no-data/topic-chart-no-data.component";
import { TopicChartComponent } from "../topic-chart/topic-chart.component";
import { TopicHourlyChartService } from "./topic-hourly-chart.service";

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
    private topicService = inject(TopicService);

    public topicEffect = effect(() => {
        const topic = this.topicService.topic();
        if (topic && topic.id)
            this.topicHourlyChartService.setTopicId(topic.id);
    }, { allowSignalWrites: true });

    ngOnInit() {
        // this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
        //     const rawId = params.get("id");
        //     const numericId = Number(rawId);
        //     if (!Number.isNaN(numericId)) {
        //         this.topicHourlyChartService.setTopicId(numericId);
        //     }
        // });

        // toObservable(this.topicService.topic).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((topic) => {
        //     if (topic && topic.id) {
        //         this.topicHourlyChartService.setTopicId(topic.id);
        //     }
        // });
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
