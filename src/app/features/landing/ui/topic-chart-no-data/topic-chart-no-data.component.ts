import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
    selector: "app-topic-chart-no-data",
    standalone: true,
    imports: [],
    templateUrl: "./topic-chart-no-data.component.html",
    styleUrl: "./topic-chart-no-data.component.scss",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicChartNoDataComponent {}
