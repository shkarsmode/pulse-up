import { TopicService } from "@/app/features/landing/pages/topic/topic.service";
import { ButtonToggleComponent } from "@/app/shared/components/ui-kit/buttons/button-toggle/button-toggle.component";
import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { TopicChartNoDataComponent } from "../topic-chart-no-data/topic-chart-no-data.component";
import { TopicChartComponent } from "../topic-chart/topic-chart.component";
import { TopicDailyChartService } from "./topic-daily-chart.service";

@Component({
    selector: "app-topic-daily-chart",
    standalone: true,
    imports: [TopicChartComponent, ButtonToggleComponent, TopicChartNoDataComponent],
    templateUrl: "./topic-daily-chart.component.html",
    styleUrl: "./topic-daily-chart.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicDailyChartComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private destroyRef = inject(DestroyRef);

    private topicDailyChartService = inject(TopicDailyChartService);
    private topicService = inject(TopicService);

    public topicEffect = effect(() => {
        const topic = this.topicService.topic();
        if (topic && topic.id)
            this.topicDailyChartService.setTopicId(topic.id);
    }, { allowSignalWrites: true });

    ngOnInit() {
        // this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
        //     const rawId = params.get("id");
        //     const numericId = Number(rawId);
        //     console.log('TopicDailyChartComponent: Retrieved id from route params:', rawId);
        //     if (!Number.isNaN(numericId)) {
        //         this.topicDailyChartService.setTopicId(numericId);
        //     }
        // });

        // // If the page was loaded via shareKey (non-numeric), listen for topic being loaded
        // // and set topicId from the resolved topic.
        // toObservable(this.topicService.topic).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((topic) => {
        //     if (topic && topic.id) {
        //         this.topicDailyChartService.setTopicId(topic.id);
        //     }
        // });
    }

    public isLoading = this.topicDailyChartService.isLoading;
    public data = this.topicDailyChartService.data;
    public labels = this.topicDailyChartService.labels;
    public isEmpty = this.topicDailyChartService.isEmpty;
    public toggleOptions = [
        { label: "Cumulative", value: "cumulative" },
        { label: "Daily", value: "daily" },
    ];
    public handleToggleChange(value: string) {
        this.topicDailyChartService.setCumulativeMode(value === "cumulative");
    }
}
