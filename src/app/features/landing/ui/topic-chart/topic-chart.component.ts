import {
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    input,
    ViewChild,
} from "@angular/core";
import { ChartConfiguration, ChartType } from "chart.js";
import { BaseChartDirective } from "ng2-charts";

@Component({
    selector: "app-topic-chart",
    standalone: true,
    imports: [BaseChartDirective],
    templateUrl: "./topic-chart.component.html",
    styleUrls: ["./topic-chart.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopicChartComponent {
    @ViewChild("canvas") canvas: ElementRef;
    @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

    public lineChartType: ChartType = "line";
    public data = input<number[]>([]);
    public labels = input<string[]>([]);
    public lineChartData = computed<ChartConfiguration["data"]>(() => {
        const data = this.data();
        const labels = this.labels();
        return {
            datasets: [
                {
                    data,
                    label: "Pulses",
                    backgroundColor: "rgba(240, 229, 250, 0.5)",
                    borderColor: "#5e00cc",
                    pointBackgroundColor: "#5e00cc",
                    pointBorderColor: "#fff",
                    pointHoverBackgroundColor: "#fff",
                    pointHoverBorderColor: "#5e00cc",
                    fill: "origin",
                },
            ],
            labels,
        };
    });

    public lineChartOptions: ChartConfiguration["options"] = {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
            line: {
                tension: 0.5,
            },
        },
        scales: {
            y: {
                grid: {
                    color: "#ededed",
                    display: false,
                },
                ticks: {
                    stepSize: 1,
                },
                min: 0,
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    source: "auto",
                    maxRotation: 0,
                    autoSkip: true,
                },
            },
        },

        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function () {
                        return "";
                    },
                    beforeBody: function (tooltipData) {
                        return `Pulses: ${tooltipData[0].formattedValue}`;
                    },
                },
            },
        },
    };
}
